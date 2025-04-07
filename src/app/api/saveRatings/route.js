import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { albumId, ratings, averageRating } = await req.json();

    if (!albumId || !ratings || averageRating === null) {
      return Response.json(
        { message: "Album ID, ratings, and average rating are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Save the initial ratings to the ratings collection
    const result = await db.collection("ratings").insertOne({
      albumId, // Use Spotify album ID
      ratings,
      averageRating,
      createdAt: new Date(),
    });

    // Save the average rating to the ratinghistories collection
    await db.collection("ratinghistories").insertOne({
      albumId, // Use Spotify album ID
      averageRating,
      date: new Date(), // Use the current date for the history entry
    });

    return Response.json(
      { message: "Ratings and history saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save ratings and history:", error);
    return Response.json(
      { message: "Failed to save ratings and history", error },
      { status: 500 }
    );
  }
}
