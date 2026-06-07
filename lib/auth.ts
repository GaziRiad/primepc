import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import startDbConnection from "./db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/notifications";
import { consumeRateLimit } from "@/lib/rateLimit";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
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
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

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
          email: new RegExp(`^${escapeRegex(email)}$`, "i"),
          passwordHash: { $exists: true, $ne: "" },
        })
          .select("_id name email image passwordHash role createdAt")
          .lean();

        if (!user?.passwordHash) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt,
        };
      },
    }),
  ],
  trustHost: true, // Add this line
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await startDbConnection();

        const email = String(user.email ?? "")
          .trim()
          .toLowerCase();
        if (!email) return false;

        const userExists = await User.findOne({
          email: new RegExp(`^${escapeRegex(email)}$`, "i"),
        });

        if (!userExists) {
          const newUser = await User.create({
            name: user.name,
            email,
            image: user.image,
          });

          user.id = newUser._id.toString();

          void sendWelcomeEmail({
            email: newUser.email,
            name: newUser.name,
          });
        } else {
          if (userExists.email !== email) {
            userExists.email = email;
            await userExists.save();
          }
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

      if (user?.email) {
        const email = String(user.email ?? "")
          .trim()
          .toLowerCase();
        if (!email) return token;

        const dbUser = await User.findOne({
          email: new RegExp(`^${escapeRegex(email)}$`, "i"),
        }).select("_id role createdAt");
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.createdAt = dbUser.createdAt;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      const userId = typeof token.id === "string" ? token.id : "";
      if (!userId) return session;

      await startDbConnection();
      const user = await User.findById(userId)
        .select("name email image")
        .lean();
      if (!user) {
        session.user.id = "";
        session.user.role = undefined;
        session.user.createdAt = undefined;
        return session;
      }

      session.user.id = userId;
      session.user.role = token.role as string;
      if (typeof user.name === "string" && user.name.length > 0) {
        session.user.name = user.name;
      }
      if (typeof user.email === "string" && user.email.length > 0) {
        session.user.email = user.email;
      }
      if (typeof user.image === "string") {
        session.user.image = user.image;
      }
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
