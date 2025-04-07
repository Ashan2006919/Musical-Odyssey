export const runtime = "nodejs"; // 👈 Important for MongoDB compatibility

import dbConnect from '@/lib/dbConnect';
import Rating from '@/models/Rating';

export async function GET() {
  try {
    await dbConnect();
    const ratings = await Rating.find({});
    
    return Response.json(ratings, { status: 200 });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return Response.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}
