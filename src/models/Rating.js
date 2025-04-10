import mongoose from "../lib/mongodb";

const RatingSchema = new mongoose.Schema({
  albumId: { type: String, required: true, unique: true },
  ratings: { type: Map, of: String, required: true },
  averageRating: { type: String, required: false }, // Add this field
});

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);