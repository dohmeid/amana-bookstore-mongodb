import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { Book } from '@/app/types';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const COLLECTION_NAME = 'books';

// Return a single book's details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: bookId } = await context.params;

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const book = await db.collection(COLLECTION_NAME).findOne({ id: bookId });

    if (!book) {
      return NextResponse.json({ error: `Book with ID '${bookId}' not found` }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (err) {
    console.error(`Failed to fetch book ${bookId}:`, err);
    return NextResponse.json({ error: 'Failed to fetch book data' }, { status: 500 });
  }
}

// Update a book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Prevent changing the _id or id
    delete body._id;
    delete body.id;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const updateResult = await db.collection<Book>(COLLECTION_NAME).updateOne(
      { id: id },
      { $set: body }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const updatedBook = await db.collection<Book>(COLLECTION_NAME).findOne({ id: id });

    return NextResponse.json(
      {
        message: 'Book updated successfully',
        book: updatedBook,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(`Error updating book ${id}:`, err);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const deleteResult = await db.collection<Book>(COLLECTION_NAME).deleteOne({ id: id });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Book deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error(`Error deleting book ${id}:`, err);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}