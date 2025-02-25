import dbConnect from '@/lib/dbConnect';
import Rating from '@/models/Rating';

export async function POST(req) {
  try {
    const { albumId, ratings } = await req.json(); // Remove averageRating

    await dbConnect();

    const existingRating = await Rating.findOne({ albumId });

    if (existingRating) {
      existingRating.ratings = ratings;
      await existingRating.save();
    } else {
      const newRating = new Rating({
        albumId,
        ratings,
      });
      await newRating.save();
    }

    return Response.json({ message: 'Ratings saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving ratings:', error);
    return Response.json({ error: 'Failed to save ratings' }, { status: 500 });
  }
}
