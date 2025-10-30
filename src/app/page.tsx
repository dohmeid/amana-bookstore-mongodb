'use client';
import { useState, useEffect } from 'react';
import BookGrid from './components/BookGrid';
import { Book } from './types';
import { getAnonymousUserId } from './lib/cartHelper';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleAddToCart = async (bookId: string) => {
    const bookToAdd = books.find(b => b.id === bookId);
    if (!bookToAdd) return;

    const userId = getAnonymousUserId();

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity: 1, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 text-gray-600">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-10 rounded-lg mb-12 shadow-lg">
        <h1 className="text-4xl font-extrabold mb-3">
          Welcome to the BookStore
        </h1>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
          Your one-stop shop for the best books. Discover new worlds, expand your knowledge, and find your next great read.
        </p>
      </section>

      {/* Book Grid */}
      {books.length > 0 ? (
        <BookGrid books={books} onAddToCart={handleAddToCart} />
      ) : (
        <div className="text-center py-10 text-gray-600">No books found in the database.</div>
      )}
    </div>
  );
};