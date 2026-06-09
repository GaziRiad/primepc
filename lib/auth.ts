import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import startDbConnection from "./db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/notifications";
import { consumeRateLimit } from "@/lib/rateLimit";
import {
  escapeAuthRegex,
  isValidAuthEmail,
  isValidAuthPassword,
  normalizeAuthEmail,
} from "@/lib/authValidation";

class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    error: "/auth-error",
    signIn: "/signin",
  },
  session: {
    maxAge: 30 * 24 * 60 * 60,
    strategy: "jwt",
  },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = normalizeAuthEmail(credentials?.email);
        const password = String(credentials?.password ?? "");

        if (!isValidAuthEmail(email) || !isValidAuthPassword(password)) {
          return null;
        }

        const [ipLimit, emailLimit] = await Promise.all([
          consumeRateLimit(request, {
            limit: 20,
            scope: "auth:credentials:ip",
            windowMs: 15 * 60 * 1000,
          }),
          consumeRateLimit(request, {
            identifier: email,
            limit: 8,
            scope: "auth:credentials:email",
            windowMs: 15 * 60 * 1000,
          }),
        ]);

        if (!ipLimit.allowed || !emailLimit.allowed) {
          throw new RateLimitedSignin();
        }

        await startDbConnection();
        const user = await User.findOne({
          email: new RegExp(`^${escapeAuthRegex(email)}$`, "i"),
          passwordHash: { $exists: true, $ne: "" },
        })
          .select(
            "_id name email image +passwordHash role createdAt sessionVersion",
          )
          .lean();

        if (!user?.passwordHash) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        await User.updateOne(
          { _id: user._id },
          {
            $addToSet: { providers: "credentials" },
            $set: { lastLoginAt: new Date() },
          },
        );

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt,
          sessionVersion: Number(user.sessionVersion ?? 0),
        };
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await startDbConnection();

        const email = normalizeAuthEmail(user.email);
        if (!isValidAuthEmail(email) || profile?.email_verified !== true) {
          return false;
        }

        const userExists = await User.findOne({
          email: new RegExp(`^${escapeAuthRegex(email)}$`, "i"),
        });

        if (!userExists) {
          let newUser;

          try {
            newUser = await User.create({
              name: user.name,
              email,
              image: user.image,
              provider: "google",
              providers: ["google"],
            });
          } catch (error) {
            if (
              typeof error !== "object" ||
              error === null ||
              !("code" in error) ||
              error.code !== 11000
            ) {
              throw error;
            }

            const racedUser = await User.findOne({
              email: new RegExp(`^${escapeAuthRegex(email)}$`, "i"),
              provider: "google",
            });

            if (!racedUser) return false;
            user.id = racedUser._id.toString();
            return true;
          }

          user.id = newUser._id.toString();

          await sendWelcomeEmail({
            email: newUser.email,
            name: newUser.name,
          }).catch((error) => {
            console.error("Google welcome email failed:", error);
          });
        } else {
          if (userExists.email !== email) {
            userExists.email = email;
          }

          // if (user.image) userExists.image = user.image;
          // userExists.addToSet("providers", "google");
          // userExists.lastLoginAt = new Date();
          // await userExists.save();
          // user.id = userExists._id.toString();

          if (user.image) userExists.image = user.image;

          const providers = Array.isArray(userExists.providers)
            ? userExists.providers
            : [];

          if (!providers.includes("google")) {
            userExists.providers = [...providers, "google"];
          }

          userExists.lastLoginAt = new Date();
          await userExists.save();
          user.id = userExists._id.toString();
        }
      }

      return true;
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return Boolean(auth?.user?.id);
    },

    async jwt({ token, user }) {
      if (user?.id) token.id = String(user.id);
      if (user?.role) token.role = user.role;
      if (user?.createdAt) token.createdAt = user.createdAt;
      if (typeof user?.sessionVersion === "number") {
        token.sessionVersion = user.sessionVersion;
      }

      const userId = typeof token.id === "string" ? token.id : "";
      if (!userId) return token;

      await startDbConnection();
      const dbUser = await User.findById(userId)
        .select("name email image role createdAt sessionVersion")
        .lean();
      const sessionVersion = Number(dbUser?.sessionVersion ?? 0);

      if (
        !dbUser ||
        (typeof token.sessionVersion === "number" &&
          token.sessionVersion !== sessionVersion)
      ) {
        delete token.id;
        delete token.role;
        delete token.createdAt;
        delete token.sessionVersion;
        token.name = null;
        token.email = null;
        token.picture = null;
        return token;
      }

      token.id = dbUser._id.toString();
      token.role = dbUser.role;
      token.createdAt = dbUser.createdAt;
      token.sessionVersion = sessionVersion;
      token.name = dbUser.name || null;
      token.email = dbUser.email || null;
      token.picture = dbUser.image || null;
      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      const userId = typeof token.id === "string" ? token.id : "";
      if (!userId) {
        session.user.id = "";
        session.user.role = undefined;
        session.user.createdAt = undefined;
        session.user.name = null;
        session.user.email = "";
        session.user.image = null;
        return session;
      }

      session.user.id = userId;
      session.user.role = token.role as string;
      session.user.name = token.name;
      session.user.email = token.email ?? "";
      session.user.image = token.picture;
      const createdAt =
        token.createdAt instanceof Date
          ? token.createdAt
          : typeof token.createdAt === "string" ||
              typeof token.createdAt === "number"
            ? new Date(token.createdAt)
            : undefined;

      session.user.createdAt = createdAt;
      return session;
    },
  },
});
