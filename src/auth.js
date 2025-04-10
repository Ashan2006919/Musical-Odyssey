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
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let omid = "";
  for (let i = 0; i < 12; i++) {
    omid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return omid;
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
        try {
          const { email, password } = credentials;

          // Connect to MongoDB
          const db = await connectToDatabase();
          const usersCollection = db.collection("users");

          // Check if the user exists
          const user = await usersCollection.findOne({ email });
          if (!user) {
            throw new Error(
              JSON.stringify({ message: "User not found. Please register." })
            );
          }

          // Validate the password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            throw new Error(
              JSON.stringify({ message: "Invalid password. Please try again." })
            );
          }

          // Return user data if authentication is successful
          return {
            id: user._id.toString(),
            omid: user.omid,
            email: user.email,
            name: user.username,
            image: user.profileImageUrl || "/images/default-profile.png",
          };
        } catch (error) {
          console.error("Authorization error:", error.message);
          throw new Error(error.message); // Pass the error message to next-auth
        }
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
      console.log("Session callback triggered:", session); // Debugging line
      console.log("Token data:", token); // Debugging line
      session.user.id = token.id;
      session.user.omid = token.omid;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
});
