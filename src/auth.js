import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import SpotifyProvider from "next-auth/providers/spotify";
import GitHubProvider from "next-auth/providers/github";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendVerificationEmail } from "@/utils/email"; // Import the utility function

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

// Function to generate a verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// Function to generate and store OTP
async function generateAndStoreOTP(email) {
  const db = await connectToDatabase();
  const usersCollection = db.collection("users");

  const verificationCode = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

  // Update the user's document with the OTP and expiration
  await usersCollection.updateOne(
    { email },
    { $set: { verificationCode, verificationCodeExpiresAt: expiresAt } }
  );

  return verificationCode;
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

        const user = await usersCollection.findOne({
          email: credentials.email,
          provider: "credentials",
        });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid password.");
        }

        if (!user.verified) {
          const verificationCode = await generateAndStoreOTP(user.email);
          await sendVerificationEmail(user.email, verificationCode); // Use the utility function

          // Return null to indicate the user is not authenticated
          return null;
        }

        return user;
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
          const isDevelopment =
            process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
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
          token.verified = existingUser.verified || false; // Include verified status
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
      session.user.verified = token.verified || false; // Include verified status in session
      session.user.provider = token.provider || "Unknown"; // Include provider in session
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
});
