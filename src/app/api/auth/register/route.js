// app/api/auth/register/route.js

import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { MongoClient } from 'mongodb';  // MongoDB client (adjust based on your setup)

// MongoDB connection (replace with your actual MongoDB URI)
const client = new MongoClient(process.env.MONGODB_URI);
let db, usersCollection;

client.connect().then(() => {
  db = client.db('test');  // replace with your actual DB name
  usersCollection = db.collection('users');  // Replace with your collection name
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

// Handle POST request (user registration)
export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    // Check if all fields are provided
    if (!username || !email || !password) {
      console.error('Missing required fields:', { username, email, password });
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Check if user already exists in the database
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.error('User already exists:', email);
      return new Response(
        JSON.stringify({ message: "User already exists with this email." }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateOTP();  // Generate a 6-digit OTP

    // Store OTP and user data in memory
    verificationCodes[email] = {
      code: verificationCode,
      userData: { username, email, password: hashedPassword },
    };

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    // Log OTP for debugging
    console.log('Generated OTP for email:', email, 'is:', verificationCode);

    // After registration, redirect to the OTP verification page with the OTP code in the query string
    return new Response(
      JSON.stringify({ 
        message: "Registration successful. Please check your email for the verification code.",
        otp: verificationCode, // Pass OTP code here to verify
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during registration:', error);
    return new Response(
      JSON.stringify({ message: "Something went wrong." }),
      { status: 500 }
    );
  }
}

// Handle PUT request (email verification)
export async function PUT(req) {
  try {
    const { email, verificationCode } = await req.json();

    // Log the input for debugging
    console.log('Verifying OTP for:', email, 'with code:', verificationCode);

    if (!verificationCodes[email]) {
      console.error('No OTP found for email:', email);
      return new Response(
        JSON.stringify({ message: "No verification request found for this email." }),
        { status: 400 }
      );
    }

    // Ensure both are strings to avoid type mismatch
    if (verificationCodes[email].code !== verificationCode) {
      console.error('Invalid OTP code:', verificationCode, 'Expected:', verificationCodes[email].code);
      return new Response(
        JSON.stringify({ message: "Invalid verification code." }),
        { status: 400 }
      );
    }

    // Get user data from temporary storage
    const userData = verificationCodes[email].userData;

    // Store user data in the database
    await usersCollection.insertOne({
      ...userData,
      verified: true,  // Mark user as verified
    });

    // Clean up the temporary store
    delete verificationCodes[email];

    return new Response(
      JSON.stringify({ message: "Account verified and registration completed!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during verification:', error);
    return new Response(
      JSON.stringify({ message: "Something went wrong." }),
      { status: 500 }
    );
  }
}
