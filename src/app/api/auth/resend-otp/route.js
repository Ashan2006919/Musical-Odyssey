import { MongoClient } from "mongodb";
import { sendVerificationEmail } from "@/utils/email";

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("test"); // Replace with your database name
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required." }),
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found." }),
        { status: 404 }
      );
    }

    if (user.verified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User is already verified.",
        }),
        { status: 400 }
      );
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

    await usersCollection.updateOne(
      { email },
      { $set: { verificationCode, verificationCodeExpiresAt: expiresAt } }
    );

    // Use the utility function to send the email
    await sendVerificationEmail(email, verificationCode);

    return new Response(
      JSON.stringify({
        success: true,
        message: "A new OTP has been sent to your email.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong. Please try again.",
      }),
      { status: 500 }
    );
  }
}