import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import GitHubProvider from "next-auth/providers/github";
import { v4 as uuidv4 } from "uuid";
import axios from "axios"; // Import axios for API requests

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

// Function to fetch country using geolocation API
async function fetchCountry(ip) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    if (response.data && response.data.country) {
      return response.data.country;
    }
    return "Unknown"; // Default if country cannot be determined
  } catch (error) {
    console.error("Error fetching country:", error.message);
    return "Unknown";
  }
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

          const db = await connectToDatabase();
          const usersCollection = db.collection("users");

          const user = await usersCollection.findOne({ email });
          if (!user) {
            throw new Error(
              JSON.stringify({ message: "User not found. Please register." })
            );
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            throw new Error(
              JSON.stringify({ message: "Invalid password. Please try again." })
            );
          }

          return {
            id: user._id.toString(),
            omid: user.omid,
            email: user.email,
            name: user.username,
            image: user.profileImageUrl || "/images/default-profile.png",
            isAdmin: user.isAdmin || false, // Include isAdmin in the user object
            country: user.country || "Unknown", // Include country in the user object
          };
        } catch (error) {
          console.error("Authorization error:", error.message);
          throw new Error(error.message);
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
    async jwt({ token, account, user, req }) {
      const db = await connectToDatabase();
      const usersCollection = db.collection("users");
      const userGrowthHistoryCollection = db.collection("userGrowthHistory");

      if (account && user) {
        const existingUser = await usersCollection.findOne({
          email: user.email,
          provider: account.provider,
        });

        if (!existingUser) {
          const omid = generateOMID();

          // Extract IP address
          const isDevelopment = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
          const ip = isDevelopment
            ? "8.8.8.8" // Mock IP for local development
            : req?.headers["x-forwarded-for"]?.split(",")[0] ||
              req?.socket?.remoteAddress ||
              "127.0.0.1";
          console.log("Extracted IP Address:", ip); // Debug log

          // Fetch country using the user's IP address
          const country = await fetchCountry(ip);
          console.log("Fetched Country:", country); // Debug log

          await usersCollection.insertOne({
            email: user.email,
            name: user.name || "Anonymous",
            image: user.image || "/images/default-profile.png",
            omid,
            provider: account.provider,
            country, // Save country information
            createdAt: new Date(),
            isAdmin: false,
          });

          token.omid = omid;
          token.isAdmin = false;
          token.country = country; // Include country in token

          // Track new user growth
          const today = new Date().toISOString().split("T")[0];
          await userGrowthHistoryCollection.updateOne(
            { date: today },
            { $inc: { totalUsers: 1 } },
            { upsert: true }
          );
        } else {
          token.omid = existingUser.omid;
          token.isAdmin = existingUser.isAdmin || false;
          token.country = existingUser.country || "Unknown"; // Include country in token
        }

        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.provider = account.provider;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.omid = token.omid;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      session.user.isAdmin = token.isAdmin;
      session.user.country = token.country || null; // Include country in session
      session.user.needsCountry = !token.country; // Flag if country is missing
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
});
