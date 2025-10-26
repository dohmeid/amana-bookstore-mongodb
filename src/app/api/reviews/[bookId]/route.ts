import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb'; // Adjusted path for clarity
import { Review } from '@/app/types'; // Import your Review type

type Params = {
  bookId: string;
};

// GET /api/reviews/[bookId] - Return all reviews for a specific book
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json(
      { error: 'Book ID is required' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookStoreData');

    // Find reviews where the 'bookId' field matches the ID from the URL
    const reviews = await db
      .collection<Review>('reviews') // Assuming your collection is named 'reviews'
      .find({ bookId: bookId })
      .toArray();

    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}