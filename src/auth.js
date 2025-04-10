import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import GitHubProvider from "next-auth/providers/github";
import { v4 as uuidv4 } from "uuid";

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db("test"); // Your MongoDB database name
  return db;
}

// Function to generate a unique OMID
function generateOMID() {
  return uuidv4(); // Use UUID for guaranteed uniqueness
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
          return {
            id: user._id.toString(),
            omid: user.omid, // Include OMID in the user object
            email: user.email,
            name: user.username,
            image: user.profileImageUrl || "/images/default-profile.png", // Set the image URL
          }; // Return user info on success
        }

        return null; // Password is invalid
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
      const db = await connectToDatabase();
      const usersCollection = db.collection("users");

      // On sign-in, store the user's profile information
      if (account && user) {
        // Check if the user already exists in the database with the same email and provider
        const existingUser = await usersCollection.findOne({
          email: user.email,
          provider: account.provider, // Match by email and provider
        });

        if (!existingUser) {
          // If the user doesn't exist, create a new user with a unique OMID
          const omid = generateOMID(); // Generate a unique OMID
          await usersCollection.insertOne({
            email: user.email,
            name: user.name || "Anonymous",
            image: user.image || "/images/default-profile.png",
            omid, // Assign the generated OMID
            provider: account.provider, // Store the provider (Google, GitHub, Spotify)
            createdAt: new Date(),
          });

          token.omid = omid; // Include the new OMID in the token
        } else {
          // If the user exists, fetch their OMID
          token.omid = existingUser.omid;
        }

        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image; // Store the image URL
      }

      console.log("JWT token:", token); // Debugging line
      return token;
    },
    async session({ session, token }) {
      // Include profile info in the session object
      session.user.id = token.id;
      session.user.omid = token.omid; // Include OMID in the session
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image; // Attach the image URL to the session
      console.log("Session callback:", session); // Debugging line
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  pages: {
    signIn: "/auth/login", // Custom sign-in page path (if you have one)
    error: "/auth/error",   // Custom error page path (if you have one)
  },
});
