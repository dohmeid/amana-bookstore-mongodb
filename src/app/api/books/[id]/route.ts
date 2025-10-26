import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

// GET /api/books/[id] - Return a single book by its MongoDB ID or unique book ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {

  const { id: bookId } = await context.params;

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookStoreData');

    let query: any;
    query = { id: bookId };

    const book = await db
      .collection('books')
      .findOne(query);

    if (!book) {
      return NextResponse.json({ error: `Book with ID '${bookId}' not found` }, { status: 404 });
    }
    return NextResponse.json(book);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch book data' }, { status: 500 });
  }
}