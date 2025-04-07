export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/mongodb";
import { signJwt } from "@/utils/jwt";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log("Login attempt for email:", email);

    const { db } = await connectToDatabase();
    console.log("Connected to database:", db.databaseName);
    const usersCollection = db.collection("users");
    console.log("Accessed users collection:", usersCollection.collectionName);

    const user = await usersCollection.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      console.error("User not found for email:", email);
      return new Response(JSON.stringify({ message: "User not found." }), {
        status: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password for email:", email);
      return new Response(JSON.stringify({ message: "Invalid credentials." }), {
        status: 401,
      });
    }

    const token = signJwt({ id: user._id, email: user.email });
    console.log("Login successful for email:", email);
    return new Response(
      JSON.stringify({ message: "Login successful!", token }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return new Response(JSON.stringify({ message: "Something went wrong." }), {
      status: 500,
    });
  }
}
