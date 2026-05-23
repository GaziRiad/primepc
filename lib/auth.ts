import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import startDbConnection from "./db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/notifications";

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
  ],
  trustHost: true, // Add this line
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await startDbConnection();

        const userExists = await User.findOne({ email: user.email });

        if (!userExists) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });

          user.id = newUser._id.toString();

          void sendWelcomeEmail({
            email: newUser.email,
            name: newUser.name,
          });
        } else {
          user.id = userExists._id.toString();
        }
      }

      return true;
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await User.findOne({ email: user.email }).select(
          "_id role createdAt",
        );
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.createdAt = dbUser.createdAt;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        const createdAt =
          token.createdAt instanceof Date
            ? token.createdAt
            : typeof token.createdAt === "string" ||
                typeof token.createdAt === "number"
              ? new Date(token.createdAt)
              : undefined;

        session.user.createdAt = createdAt;
      }
      return session;
    },
  },
});
