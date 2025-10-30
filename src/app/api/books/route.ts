import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const COLLECTION_NAME = 'books';

// Return all books
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const books = await db
      .collection(COLLECTION_NAME)
      .find({})
      .toArray();

    return NextResponse.json(books);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

// Create a new book
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.author || !body.price || !body.id) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title, author, and price.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(COLLECTION_NAME).insertOne(body);

    if (!result.acknowledged) {
      throw new Error("MongoDB insert operation failed.");
    }

    const insertedBook = {
      ...body,
      _id: result.insertedId,
    };

    return NextResponse.json(
      { message: 'Book created successfully', book: insertedBook },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating book:', err);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}