// app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// Example data storage (use your database for production)
let users = [];

export const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: "/auth/login",  // Custom sign-in page
    error: "/auth/error",    // Custom error page
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
