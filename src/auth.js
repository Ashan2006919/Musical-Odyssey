import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import GitHubProvider from "next-auth/providers/github";

let MongoClient;
let client;

// Ensure MongoDB is only used on the server
if (typeof window === 'undefined') {
  MongoClient = require("mongodb").MongoClient;

  // MongoDB setup
  const uri = process.env.MONGODB_URI;
  client = new MongoClient(uri);
}

// Connect to MongoDB
async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db("test"); // Your MongoDB database name
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
        const { email, password } = credentials || {};

        // Connect to MongoDB
        const db = await connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if the user exists in the database
        const user = await usersCollection.findOne({ email });

        if (!user) {
          return null; // No user found
        }

        // Compare provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          return { id: user._id.toString(), email: user.email }; // Return user info on success
        }

        return null; // Password is invalid
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // Connect to MongoDB
        const db = await connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if the user exists in the database
        let user = await usersCollection.findOne({ email: profile.email });

        if (!user) {
          // If user doesn't exist, create a new one
          user = {
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            createdAt: new Date(),
          };
          await usersCollection.insertOne(user);
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private",
      profile(profile) {
        return {
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images?.[0]?.url,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
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
