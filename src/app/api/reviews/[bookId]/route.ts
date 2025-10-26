import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

// GET /api/reviews/[bookId] - Return all reviews for a specific book
export async function GET(request: Request, context: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await context.params;

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookStoreData');

    // Find reviews where the 'bookId' field matches the ID from the URL
    const reviews = await db
      .collection('reviews')
      .find({ bookId: bookId })
      .toArray();

    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}