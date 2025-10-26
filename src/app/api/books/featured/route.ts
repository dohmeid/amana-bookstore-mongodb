import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

// Display Featured Books
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookStoreData');

    const books = await db
      .collection('books')
      .find({})
      .toArray();

    return NextResponse.json(books);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function GET() {
    const { books } = booksData;
    const featuredBooks = books.filter((book) => book.featured);
    return NextResponse.json(featuredBooks);
}