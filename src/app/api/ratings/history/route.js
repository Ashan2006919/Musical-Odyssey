export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get("albumId");
    const userOmid = searchParams.get("userOmid");

    if (!albumId || !userOmid) {
      return Response.json(
        { message: "albumId and userOmid are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Fetch rating history for the specific album and user
    const history = await db
      .collection("ratinghistories")
      .find({ albumId, userOmid }) // Filter by albumId and userOmid
      .sort({ date: 1 }) // Sort by date in ascending order
      .toArray();

    return Response.json({ history }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch rating history:", error);
    return Response.json(
      { message: "Failed to fetch rating history", error },
      { status: 500 }
    );
  }
}