export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { albumId, ratings, averageRating } = await req.json();
    const { db } = await connectToDatabase();

    console.log("Received payload:", { albumId, ratings, averageRating }); // Debug log

    // Ensure albumId and averageRating are valid
    if (!albumId || averageRating === undefined || averageRating === null) {
      throw new Error("albumId and averageRating are required but were not provided.");
    }

    // Fetch the album document to ensure it exists
    const album = await db.collection("ratings").findOne({ albumId }); // Query by albumId
    if (!album) {
      return Response.json({ message: "Rating not found" }, { status: 404 });
    }

    // Update the album's ratings and average rating
    const result = await db.collection("ratings").updateOne(
      { albumId }, // Query by albumId
      { $set: { ratings, averageRating } }
    );

    if (result.modifiedCount === 1) {
      // Insert the new average rating into the ratinghistories collection
      await db.collection("ratinghistories").insertOne({
        albumId, // Use Spotify album ID
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
