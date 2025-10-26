'use client';
import { useState, useEffect } from 'react';
import BookGrid from './components/BookGrid';
import Pagination from './components/Pagination';
import { Book, CartItem } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

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


  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  const handleAddToCart = (bookId: string) => {
    const bookToAdd = books.find(b => b.id === bookId);
    if (!bookToAdd) return;

    const cartItem: CartItem = {
      id: `${bookId}-${Date.now()}`,
      bookId: bookId,
      quantity: 1, // Default quantity
      addedAt: new Date().toISOString(),
    };

    // Retrieve and update existing cart from localStorage (keep for now, as cart API is a placeholder)
    const storedCart = localStorage.getItem('cart');
    const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    const existingItemIndex = cart.findIndex((item) => item.bookId === bookId);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading books...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (books.length === 0) {
    return <div className="text-center py-10 text-gray-600">No books found in the database.</div>;
  }


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
      {
        !isLoading && !error && (
          <BookGrid books={books} onAddToCart={handleAddToCart} />
        )
      }    </div >
  );
};