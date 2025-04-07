export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { MongoClient } from 'mongodb';  // MongoDB client
import multer from "multer";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb"; // Optional: For storing images in MongoDB

// MongoDB connection (replace with your actual MongoDB URI)
const client = new MongoClient(process.env.MONGODB_URI);
let db, usersCollection;

client.connect().then(() => {
  db = client.db('test');  // replace with your actual DB name
  usersCollection = db.collection('users');  // Replace with your collection name
  const otpCollection = db.collection("otps");
});

// In-memory storage for OTPs (will reset if server restarts)
let verificationCodes = {};  // <-- Declare this variable here

// Generate a 6-digit OTP (stored as string)
function generateOTP() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();  // Generates a 6-digit string
}

// Send verification email
async function sendVerificationEmail(email, code) {
  // Log OTP for debugging
  console.log('Sending OTP to email:', email, 'OTP code:', code);

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
    text: `Your verification code is: ${code}`,  // Send the 6-digit code
  };

  await transporter.sendMail(mailOptions);
}

const upload = multer({ storage: multer.memoryStorage() });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const profileImage = formData.get("profileImage");

    // Validate input fields
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "User already exists with this email." }),
        { status: 400 }
      );
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateOTP();

    // Handle profile image upload (optional)
    let profileImageUrl = "/images/default-profile.png"; // Default profile picture
    if (profileImage && profileImage.size > 0) {
      const bucket = new GridFSBucket(db, { bucketName: "profileImages" });
      const uploadStream = bucket.openUploadStream(email);
      const readableStream = Readable.from(profileImage.stream());
      readableStream.pipe(uploadStream);

      profileImageUrl = `/api/profileImages/${uploadStream.id}`;
    }

    // Save OTP and user data temporarily for email verification
    verificationCodes[email] = {
      code: verificationCode,
      userData: { username, email, password: hashedPassword, profileImageUrl },
    };

    // Send the OTP via email
    await sendVerificationEmail(email, verificationCode);

    // Return response to inform user about OTP
    return new Response(
      JSON.stringify({
        message: "Registration successful. Please check your email for the verification code.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong." }),
      { status: 500 }
    );
  }
}

// Handle PUT request for email verification
export async function PUT(req) {
  try {
    const { email, verificationCode } = await req.json();

    console.log('Verifying OTP for:', email, 'with code:', verificationCode);

    // Check if OTP exists for this email
    if (!verificationCodes[email]) {
      console.error('No OTP found for email:', email);
      return new Response(
        JSON.stringify({ success: false, message: "No verification request found for this email." }),
        { status: 400 }
      );
    }

    // Validate OTP
    if (verificationCodes[email].code !== verificationCode) {
      console.error('Invalid OTP code:', verificationCode, 'Expected:', verificationCodes[email].code);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid verification code." }),
        { status: 400 }
      );
    }

    // Extract user data and insert into MongoDB
    const userData = verificationCodes[email].userData;

    // Insert verified user into the 'users' collection
    await usersCollection.insertOne({
      username: userData.username,
      email: userData.email,
      password: userData.password,  // The hashed password
      profileImageUrl: userData.profileImageUrl,
      verified: true,  // Mark as verified
    });

    // Remove the OTP entry from in-memory store
    delete verificationCodes[email];

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account verified and registration completed!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during verification:', error);
    return new Response(
      JSON.stringify({ success: false, message: "Something went wrong." }),
      { status: 500 }
    );
  }
}
