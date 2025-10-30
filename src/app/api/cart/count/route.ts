import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB_NAME || 'bookStoreData';
const CART_COLLECTION = 'cart';

/**
 * GET /api/cart/count?userId=...
 * Returns the total number of items in the cart for a user.
 * (Sum of quantities, not just number of documents)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(CART_COLLECTION).aggregate([
      {
        $match: { userId: userId }
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$quantity' }
        }
      }
    ]).toArray();

    const count = result.length > 0 ? result[0].totalItems : 0;
    return NextResponse.json({ count: count });

  } catch (err) {
    console.error('Error fetching cart count:', err);
    return NextResponse.json({ error: 'Failed to fetch cart count' }, { status: 500 });
  }
}
