import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  albumId: {
    type: String,
    required: true,
    unique: true,
  },
  ratings: {
    type: Map,
    of: Number,
    required: true,
  },
});

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);