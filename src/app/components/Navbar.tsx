'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAnonymousUserId } from '../lib/cartHelper';

// Simple Book icon for the logo
const BookLogo = () => (
  <svg
    className="w-7 h-7 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253"
    />
  </svg>
);

// Simple Cart icon
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const userId = getAnonymousUserId();
    if (!userId) return; // Don't fetch if ID is not ready
    try {
      const response = await fetch(`/api/cart/count?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count || 0);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <BookLogo />
            <span className="text-2xl font-bold text-gray-800">
              BookStore
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer text-sm font-medium"
            >
              Home
            </Link>
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative group cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={`View cart, ${cartCount} items`}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}