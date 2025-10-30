'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '../types';
import StarRating from './StarRating'; 

interface BookListItemProps {
  book: Book;
  onAddToCart?: (bookId: string) => void;
}

const BookListItem: React.FC<BookListItemProps> = ({ book, onAddToCart }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!book.inStock || isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onAddToCart) {
        onAddToCart(book.id);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center p-4 gap-4">
        {/* Book Cover/Icon - Left Side */}
        <Link href={`/book/${book.id}`} className="flex-shrink-0 cursor-pointer">
          <div className="w-16 h-20 bg-gray-200 rounded-md flex items-center justify-center hover:bg-gray-300 transition-colors duration-200">
            <div className="text-2xl text-gray-400">📚</div>
          </div>
        </Link>

        {/* Book Information - Right Side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/book/${book.id}`} className="block group cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors duration-200">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
              </Link>

              {/* Rating and Reviews */}
              <div className="flex items-center mt-2 gap-2">
                <StarRating rating={book.rating} />
                <span className="text-sm text-gray-500">
                  {book.rating.toFixed(1)} ({book.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1 mt-2">
                {book.genre.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-700"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="flex flex-col items-end flex-shrink-0">
              <p className="text-lg font-semibold text-gray-900">${book.price.toFixed(2)}</p>
              {book.inStock ? (
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || showSuccess}
                  className={`mt-2 w-28 px-3 py-1.5 text-sm font-medium text-white rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    showSuccess
                      ? 'bg-green-500'
                      : isAddingToCart
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {showSuccess ? 'Added ✓' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              ) : (
                <span className="mt-2 text-sm font-medium text-red-600">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookListItem;