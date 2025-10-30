import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { Review } from '@/app/types';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const COLLECTION_NAME = 'reviews';

// GET /api/reviews/[bookId] - Return all reviews for a specific book
export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  const { bookId } = params;

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Find reviews where the 'bookId' field matches the ID from the URL
    const reviews = await db
      .collection(COLLECTION_NAME)
      .find({ bookId: bookId }) // Assuming bookId stored on reviews is the string ID
      .toArray();

    const formattedReviews = reviews.map(review => ({
      ...review,
      id: review._id.toString(),
    }));

    return NextResponse.json(formattedReviews);
  } catch (err) {
    console.error(`Error fetching reviews for book ${bookId}:`, err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews/[bookId] - Create a new review for a book
export async function POST(request: NextRequest, { params }: { params: { bookId: string } }) {
  const { bookId } = params;

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
      verified: false, // Or logic to determine if purchase was verified
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newReview);

    const insertedReview = {
      ...newReview,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ message: 'Review created successfully', review: insertedReview }, { status: 201 });
  } catch (err) {
    console.error(`Error creating review for book ${bookId}:`, err);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}