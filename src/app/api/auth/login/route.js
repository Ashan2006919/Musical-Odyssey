import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/mongodb"; // Correct import statement
import { signJwt } from "@/utils/jwt"; // Custom JWT utility

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log("Login attempt for email:", email); // Log the email

    // Inside login API (src/app/api/auth/login/route.js)
    const { db } = await connectToDatabase();
    console.log("Connected to database:", db.databaseName); // Log database name
    const usersCollection = db.collection("users");
    console.log("Accessed users collection:", usersCollection.collectionName); // Log collection name

    const user = await usersCollection.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      console.error("User not found for email:", email); // Log if user is not found
      return new Response(JSON.stringify({ message: "User not found." }), {
        status: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password for email:", email); // Log if password is invalid
      return new Response(JSON.stringify({ message: "Invalid credentials." }), {
        status: 401,
      });
    }

    const token = signJwt({ id: user._id, email: user.email });
    console.log("Login successful for email:", email); // Log successful login
    return new Response(
      JSON.stringify({ message: "Login successful!", token }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login:", error); // Log any unexpected errors
    return new Response(JSON.stringify({ message: "Something went wrong." }), {
      status: 500,
    });
  }
}
