import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { IncomingForm } from "formidable";
import { sendVerificationEmail } from "@/utils/email"; // Import the utility function

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
let db, usersCollection;

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    console.log("Connecting to MongoDB...");
    await client.connect();
    db = client.db("test"); // Replace "test" with your database name
    usersCollection = db.collection("users");
    console.log("Connected to MongoDB and initialized usersCollection.");
  }
}

// AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(fileBuffer, fileName, mimeType) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  console.log("Uploading file with params:", {
    fileName,
    mimeType,
    bucket: process.env.S3_BUCKET_NAME,
  });

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
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

// Function to generate a verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// POST /register
export async function POST(req) {
  try {
    await connectToDatabase(); // Ensure the database connection is established

    const formData = await req.formData(); // Parse form data
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const profileImage = formData.get("profileImage");
    const provider = formData.get("provider") || "credentials"; // Default to "credentials"

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Check if a user with the same email and provider already exists
    const existingUser = await usersCollection.findOne({ email, provider });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          message: `User already exists with this email and provider (${provider}).`,
        }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const profileImageUrl = "/images/default-profile.png"; // Default profile image
    const omid = generateOMID(); // Generate the unique OMID

    // Insert the new user into the users collection
    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      omid,
      provider,
      verified: false,
      createdAt: new Date(),
    });

    // Generate a verification code and send it via email
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

    // Update the user's document with the OTP and expiration
    await usersCollection.updateOne(
      { email },
      { $set: { verificationCode, verificationCodeExpiresAt: expiresAt } }
    );

    // Use the utility function to send the email
    await sendVerificationEmail(email, verificationCode);

    // Update the userGrowthHistory collection
    const today = new Date().toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD)
    await db.collection("userGrowthHistory").updateOne(
      { date: today },
      { $inc: { totalUsers: 1 } }, // Increment the total user count
      { upsert: true } // Create a new document if it doesn't exist
    );

    return new Response(
      JSON.stringify({
        message: "Registration successful. Please verify your email.",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong. Please try again." }),
      { status: 500 }
    );
  }
}

// PUT /verify
export async function PUT(req) {
  try {
    const { email, verificationCode } = await req.json();

    if (!verificationCodes[email]) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No verification request found for this email.",
        }),
        { status: 400 }
      );
    }

    if (verificationCodes[email].code !== verificationCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid verification code.",
        }),
        { status: 400 }
      );
    }

    const userData = verificationCodes[email].userData;

    await usersCollection.insertOne({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      profileImageUrl: userData.profileImageUrl,
      omid: userData.omid, // Save OMID in the database
      provider: userData.provider || "credentials", // Default to "credentials" if not provided
      verified: true,
      createdAt: new Date(),
    });

    delete verificationCodes[email];

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account verified and registration completed!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong.",
      }),
      { status: 500 }
    );
  }
}
