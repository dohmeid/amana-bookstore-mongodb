// src/app/page.tsx
'use client';

import { useState ,useEffect} from 'react';
import BookGrid from './components/BookGrid';
import { Book } from './types';
//import { books } from './data/books';

export default function HomePage() {

 const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch books from our API endpoint
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
        fetchBooks();
  }, []); // Empty dependency array means this runs once on mount



  // Simple cart handler for demo purposes
  const handleAddToCart = (bookId: string) => {
    console.log(`Added book ${bookId} to cart`);
    // Here you would typically dispatch to a cart state or call an API
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="text-center bg-blue-100 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to the Amana Bookstore!</h1>
        <p className="text-lg text-gray-600">
          Your one-stop shop for the best books. Discover new worlds and adventures.
        </p>
      </section>

      {/* Book Grid */}
 {isLoading && <div className="text-center py-10">Loading books...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      {!isLoading && !error && (
        <BookGrid books={books} onAddToCart={handleAddToCart} />
      )}    </div>
  );
}
