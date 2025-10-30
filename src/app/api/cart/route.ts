import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { CartItem } from '@/app/types';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const CART_COLLECTION = 'cart';
const BOOKS_COLLECTION = 'books';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const cartItems = await db.collection(CART_COLLECTION).aggregate([
      {
        $match: { userId: userId }
      },

      {
        $lookup: {
          from: BOOKS_COLLECTION,
          localField: 'bookId',     // Field from 'cart' collection
          foreignField: 'id',       // Field from 'books' collection
          as: 'bookDetails'
        }
      },
      {
        $unwind: '$bookDetails'
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          quantity: 1,
          bookId: 1,
          // Format book details
          book: {
            _id: '$bookDetails._id',
            id: '$bookDetails.id', // Pass the correct custom 'id'
            title: '$bookDetails.title',
            author: '$bookDetails.author',
            price: '$bookDetails.price',
            description: '$bookDetails.description',
            genre: '$bookDetails.genre',
            rating: '$bookDetails.rating',
            reviewCount: '$bookDetails.reviewCount',
            inStock: '$bookDetails.inStock',
            featured: '$bookDetails.featured',
            image: '$bookDetails.image',
            isbn: '$bookDetails.isbn',
            tags: '$bookDetails.tags',
            datePublished: '$bookDetails.datePublished',
            pages: '$bookDetails.pages',
            language: '$bookDetails.language',
            publisher: '$bookDetails.publisher',
          }
        }
      }
    ]).toArray();

    return NextResponse.json(cartItems);
  } catch (err) {
    console.error('Error fetching cart items:', err);
    return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Adds a new item to the cart or increments quantity if it already exists.
 * Body: { bookId: string, quantity: number, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, quantity, userId } = body;

    if (!bookId || !quantity || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const updateResult = await db.collection<CartItem>(CART_COLLECTION).updateOne(
      { userId: userId, bookId: bookId },
      {
        $inc: { quantity: Number(quantity) },
        $setOnInsert: {
          userId: userId,
          bookId: bookId,
          addedAt: new Date().toISOString(),
        }
      },
      { upsert: true }
    );

    if (!updateResult.acknowledged) {
      throw new Error('Failed to update cart');
    }

    const item = await db.collection(CART_COLLECTION).findOne({ userId, bookId });

    return NextResponse.json({
      message: 'Item added/updated in cart',
      item: item
    }, { status: 200 });

  } catch (err) {
    console.error('Error adding item to cart:', err);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

/**
 * PUT /api/cart
 * Updates the quantity of an existing cart item.
 * Body: { bookId: string, quantity: number, userId: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, quantity, userId } = body;

    if (!bookId || !quantity || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (Number(quantity) <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const updateResult = await db.collection<CartItem>(CART_COLLECTION).updateOne(
      { userId: userId, bookId: bookId },
      {
        $set: { quantity: Number(quantity) }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const item = await db.collection(CART_COLLECTION).findOne({ userId, bookId });
    return NextResponse.json({ message: 'Cart item updated', item: item });

  } catch (err) {
    console.error('Error updating cart item:', err);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

/**
 * DELETE /api/cart?userId=...&bookId=... (to remove one item)
 * DELETE /api/cart?userId=...&clear=true (to clear cart)
 * Removes an item from the cart, or clears the entire cart.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');
    const clear = searchParams.get('clear');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    if (clear === 'true') {
      const deleteResult = await db.collection<CartItem>(CART_COLLECTION).deleteMany(
        { userId: userId }
      );
      return NextResponse.json({
        message: 'Cart cleared successfully',
        deletedCount: deleteResult.deletedCount
      }, { status: 200 });

    } else if (bookId) {
      const deleteResult = await db.collection<CartItem>(CART_COLLECTION).deleteOne(
        { userId: userId, bookId: bookId }
      );

      if (deleteResult.deletedCount === 0) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Item removed from cart',
        bookId: bookId
      }, { status: 200 });

    } else {
      return NextResponse.json({ error: 'Missing bookId or clear parameter' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error removing cart item:', err);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}