'use client';

import { useState, useEffect } from 'react';
import { Book, Review } from '@/app/types';
import StarRating from '@/app/components/StarRating';
import { getAnonymousUserId } from '@/app/lib/cartHelper';

interface BookPageProps {
  params: {
    id: string;
  };
}

export default function BookPage({ params }: BookPageProps) {
  const { id } = params;
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch book details
        const bookRes = await fetch(`/api/books/${id}`);
        if (!bookRes.ok) {
          throw new Error(`Failed to fetch book: ${bookRes.statusText}`);
        }
        const bookData = await bookRes.json();
        setBook(bookData);

        // Fetch reviews
        const reviewsRes = await fetch(`/api/reviews/${id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book || !book.inStock || isAddingToCart) return;

    setIsAddingToCart(true);
    const userId = getAnonymousUserId();

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, quantity: 1, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading book details...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }
  if (!book) {
    return <div className="text-center py-20">Book not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-gray-200 h-96 w-full rounded-lg flex items-center justify-center text-6xl text-gray-400">
            📚
          </div>
        </div>
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900">{book.title}</h1>
          <p className="text-xl text-gray-600 mt-2">by {book.author}</p>
          <div className="flex items-center mt-4 gap-2">
            <StarRating rating={book.rating} />
            <span className="text-gray-600">({book.reviewCount} reviews)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-6">${book.price.toFixed(2)}</p>
          <p className="text-gray-700 mt-4">{book.description}</p>
          <div className="mt-6">
            <button
              onClick={handleAddToCart}
              disabled={!book.inStock || isAddingToCart}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            {showSuccess && <span className="ml-4 text-green-600 font-semibold">Added to cart!</span>}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{review.title}</h3>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-gray-600 text-sm">by {review.author} on {new Date(review.timestamp).toLocaleDateString()}</p>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
