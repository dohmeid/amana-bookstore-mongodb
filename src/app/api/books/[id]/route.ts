import { NextResponse } from 'next/server';
// Import the connection helper
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb'; // To convert the string ID to MongoDB's ObjectId

type Params = {
  id: string; // The book ID from the URL segment
};

// GET /api/books/[id] - Return a single book by its MongoDB ID or unique book ID

export async function GET(request: Request,
  { params }: { params: Params }) {
  const bookId = params.id;

  if (!bookId) {
    return NextResponse.json(
      { error: 'Book ID is required' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'bookStoreData');

    let query: any;

    // In a typical application, you'd use a unique string ID (like "book-1") 
    // or the MongoDB ObjectId. We'll prioritize the string ID for now
    // as it matches your current static structure.

    // Assuming your static `Book` IDs are used as the unique identifier in MongoDB:
    query = { id: bookId };

    // If you prefer to use the MongoDB _id (ObjectId), use this instead:
    // try {
    //   query = { _id: new ObjectId(bookId) };
    // } catch (e) {
    //   // If the ID isn't a valid ObjectId, search by your custom 'id' field
    //   query = { id: bookId };
    // }
    const book = await db
      .collection('books')
      .findOne(query);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Convert MongoDB's _id to a simple string if necessary, 
    // although it's generally fine to leave it as an ObjectId/string.
    // Ensure the returned type matches your `Book` interface.
    return NextResponse.json(book);
  } catch (err) {
    console.error(`Error fetching book ${bookId}:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch book data' },
      { status: 500 }
    );
  }
}

// Future implementation notes:
// - Connect to a database (e.g., PostgreSQL, MongoDB)
// - Add authentication middleware for admin operations
// - Implement pagination for large datasets
// - Add filtering and search query parameters
// - Include proper error handling and logging
// - Add rate limiting for API protection
// - Implement caching strategies for better performance

// Example future database integration:
// import { db } from '@/lib/database';
//
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const page = parseInt(searchParams.get('page') || '1');
//   const limit = parseInt(searchParams.get('limit') || '10');
//   const genre = searchParams.get('genre');
//
//   try {
//     const books = await db.books.findMany({
//       where: genre ? { genre: { contains: genre } } : {},
//       skip: (page - 1) * limit,
//       take: limit,
//     });
//
//     return NextResponse.json(books);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Database connection failed' },
//       { status: 500 }
//     );
//   }
// }