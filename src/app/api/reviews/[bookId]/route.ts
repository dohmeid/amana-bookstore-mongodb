import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { Review } from '@/app/types';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const COLLECTION_NAME = 'reviews';

// Return all reviews for a specific book
export async function GET(
  request: Request,
  context: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await context.params;

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Find reviews where the 'bookId' field matches the ID from the URL
    const reviews = await db
      .collection(COLLECTION_NAME)
      .find({ bookId: bookId })
      .toArray();

    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}


// Create a new review for a book
export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { author, title, comment, rating } = body;

    if (!author || !title || !comment || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const newReview: Omit<Review, '_id' | 'id'> = {
      bookId: bookId,
      author,
      title,
      comment,
      rating,
      timestamp: new Date().toISOString(),
      verified: false,
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newReview);

    if (!result.acknowledged) {
      throw new Error("MongoDB insert operation failed.");
    }

    const insertedReview = {
      ...newReview,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    };

    return NextResponse.json(
      { message: 'Review created successfully', review: insertedReview },
      { status: 201 }
    );
  } catch (err) {
    console.error(`Error creating review for book ${bookId}:`, err);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}