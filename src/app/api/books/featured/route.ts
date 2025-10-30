import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const COLLECTION_NAME = 'books';

// Display Featured Books
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Find books where featured is true
    const books = await db.collection(COLLECTION_NAME).find({ featured: true }).toArray();

    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch featured books' }, { status: 500 });
  }
}