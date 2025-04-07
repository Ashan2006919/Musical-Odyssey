import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import GitHubProvider from "next-auth/providers/github";

let MongoClient;

if (typeof window === "undefined") {
  MongoClient = require("mongodb").MongoClient; // Dynamically import MongoDB only on the server
}

// Connect to MongoDB
async function connectToDatabase() {
  if (!MongoClient) {
    throw new Error("MongoClient is not available on the client side.");
  }
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db("test");
  return db;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = await connectToDatabase();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: credentials.email });
        if (!user) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (isPasswordValid) {
          return { id: user._id.toString(), email: user.email };
        }
        return null;
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
    async jwt({ token, account, user }) {
      // On sign-in, store the user's GitHub profile information
      if (account && user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image; // GitHub's profile image URL
      }
      return token;
    },
    async session({ session, token }) {
      // Include profile info in the session object
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      return session;
    },
  },
});
