export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { albumId, ratings, averageRating, userOmid } = await req.json();

    if (!albumId || averageRating === undefined || averageRating === null || !userOmid) {
      throw new Error("albumId, averageRating, and userOmid are required but were not provided.");
    }

    const { db } = await connectToDatabase();

    // Fetch the album document to ensure it exists
    const album = await db.collection("ratings").findOne({ albumId, userOmid }); // Query by albumId and userOmid
    if (!album) {
      return Response.json({ message: "Rating not found" }, { status: 404 });
    }

    // Update the album's ratings and average rating
    const result = await db.collection("ratings").updateOne(
      { albumId, userOmid }, // Query by albumId and userOmid
      { $set: { ratings, averageRating } }
    );

    if (result.modifiedCount === 1) {
      // Insert the new average rating into the ratinghistories collection
      await db.collection("ratinghistories").insertOne({
        albumId, // Use Spotify album ID
        userOmid, // Include the user's OMID
        date: new Date(),
        averageRating,
      });

      return Response.json(
        { message: "Ratings updated successfully" },
        { status: 200 }
      );
    } else {
      return Response.json({ message: "Rating not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to update ratings:", error);
    return Response.json(
      { message: "Failed to update ratings", error: error.message },
      { status: 500 }
    );
  }
}
