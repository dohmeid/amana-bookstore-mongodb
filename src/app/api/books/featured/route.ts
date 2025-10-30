import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const COLLECTION_NAME = 'books';

// Display Featured Books
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const books = await db.collection(COLLECTION_NAME).find({ featured: true }).toArray();

    const formattedBooks = books.map(book => ({
      ...book,
      id: book._id.toString(),
    }));

    return NextResponse.json(formattedBooks);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch featured books' }, { status: 500 });
  }
}