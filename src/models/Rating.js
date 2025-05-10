import mongoose from "mongoose";

const MONGOOSE_URI = process.env.MONGODB_URI;

if (!MONGOOSE_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGOOSE_URI, {
    dbName: process.env.MONGODB_DATABASE,
  }).catch((err) => {
    console.error("Failed to connect to MongoDB with Mongoose:", err);
  });
}

const RatingSchema = new mongoose.Schema({
  albumId: { type: String, required: true, unique: true },
  ratings: { type: Map, of: String, required: true },
  averageRating: { type: String, required: false }, // Add this field
});

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);