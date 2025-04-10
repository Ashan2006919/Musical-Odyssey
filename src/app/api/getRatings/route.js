export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import connectToDatabase from "@/utils/mongodb";
import Rating from "@/models/Rating";

export async function GET(req) {
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const userOmid = searchParams.get("userOmid");
    console.log("userOmid:", userOmid);

    // Connect to the database
    await connectToDatabase();

    // Query the database
    const query = userOmid ? { userOmid } : {};
    const ratings = await Rating.find(query);

    return Response.json(ratings, { status: 200 });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return Response.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}
