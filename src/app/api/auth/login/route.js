import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";  // Correct import statement

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log("Login attempt for email:", email); // Log the email

    const { db } = await connectToDatabase();  // Use connectToDatabase to get db
    const usersCollection = db.collection("users");  // Get the users collection

    const user = await usersCollection.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
      console.error("User not found for email:", email); // Log if user is not found
      return new Response(JSON.stringify({ message: "User not found." }), { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password for email:", email); // Log if password is invalid
      return new Response(JSON.stringify({ message: "Invalid credentials." }), { status: 401 });
    }

    console.log("Login successful for email:", email); // Log successful login
    return new Response(JSON.stringify({ message: "Login successful!" }), { status: 200 });
  } catch (error) {
    console.error("Error during login:", error); // Log any unexpected errors
    return new Response(JSON.stringify({ message: "Something went wrong." }), { status: 500 });
  }
}