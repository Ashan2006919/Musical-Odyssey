import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

dbConnect(); // Ensure the database connection is established

const RatingSchema = new mongoose.Schema({
  albumId: { type: String, required: true, unique: true },
  ratings: { type: Map, of: String, required: true },
  averageRating: { type: String, required: false }, // Add this field
});

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);