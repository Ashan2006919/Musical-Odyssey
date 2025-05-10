import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
let db;

// Connect to MongoDB
async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    db = client.db("test"); // Replace with your database name
  }
  return db;
}

// OTP Verification Endpoint
export async function PUT(req) {
  try {
    const { email, verificationCode } = await req.json();

    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Find the user and check the OTP
    const user = await usersCollection.findOne({ email });

    if (!user || !user.verificationCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No verification request found for this email.",
        }),
        { status: 400 }
      );
    }

    if (user.verificationCode !== verificationCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid verification code.",
        }),
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.verificationCodeExpiresAt)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Verification code has expired. Please request a new one.",
        }),
        { status: 400 }
      );
    }

    // Mark the user as verified and remove the OTP
    await usersCollection.updateOne(
      { email },
      { $set: { verified: true }, $unset: { verificationCode: "", verificationCodeExpiresAt: "" } }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account verified successfully!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong. Please try again.",
      }),
      { status: 500 }
    );
  }
}