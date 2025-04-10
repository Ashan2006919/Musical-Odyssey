import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { IncomingForm } from "formidable";

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

// In-memory OTP storage
let verificationCodes = {};

// OTP Generator
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

// Send verification email
async function sendVerificationEmail(email, code) {
  console.log("Sending OTP to:", email, "Code:", code);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address",
    text: `Your verification code is: ${code}`,
  };

  await transporter.sendMail(mailOptions);
}

// POST /register
export async function POST(req) {
  try {
    await connectToDatabase(); // Ensure the database connection is established

    const formData = await req.formData(); // Parse form data
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const profileImage = formData.get("profileImage");
    const provider = formData.get("provider") || "credentials"; // Default to "credentials"

    if (!username || !email || !password) {
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

    let profileImageUrl = "/images/default-profile.png";
    if (profileImage && profileImage.size > 0) {
      const fileName = `${uuidv4()}-${profileImage.name}`;
      const mimeType = profileImage.type;

      if (!["image/jpeg", "image/png"].includes(mimeType)) {
        return new Response(
          JSON.stringify({ message: "Invalid image format. Use JPEG or PNG." }),
          { status: 400 }
        );
      }

      if (profileImage.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ message: "Image exceeds 5MB size limit." }),
          { status: 400 }
        );
      }

      try {
        const buffer = await profileImage.arrayBuffer();
        profileImageUrl = await uploadToS3(Buffer.from(buffer), fileName, mimeType);
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return new Response(
          JSON.stringify({ message: "Image upload failed." }),
          { status: 500 }
        );
      }
    }

    const otpCode = generateOTP();
    const omid = generateOMID(); // Generate the unique OMID

    verificationCodes[email] = {
      code: otpCode,
      userData: {
        username,
        email,
        password: hashedPassword,
        profileImageUrl,
        omid, // Include OMID in user data
        provider, // Include the provider in user data
      },
    };

    try {
      await sendVerificationEmail(email, otpCode);
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return new Response(
        JSON.stringify({ message: "Failed to send verification email." }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        message:
          "Registration successful. Please check your email for the verification code.",
      }),
      { status: 200 }
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
      username: userData.username,
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
