// filepath: c:\Projects\Music Review\Musical-Odyssey\src\auth-options.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import GitHubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials;

        // Extract IP address
        const ip =
          process.env.NODE_ENV === "development"
            ? "8.8.8.8" // Mock IP for local development
            : req?.headers["x-forwarded-for"]?.split(",")[0] || // Use the first IP in the forwarded list
              req?.socket?.remoteAddress || // Fallback to the socket's remote address
              "127.0.0.1"; // Default to localhost
        console.log("Extracted IP Address:", ip); // Debug log

        const db = await connectToDatabase();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ email });
        if (!user) {
          throw new Error("User not found. Please register.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password. Please try again.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          image: user.profileImageUrl || "/images/default-profile.png",
          country: user.country || null,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.country = user.country || null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      session.user.country = token.country || null;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};