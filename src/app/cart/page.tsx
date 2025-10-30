'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartItem from '../components/CartItem';
import { CartItemWithBook } from '../types'; // Use the joined type
import { getAnonymousUserId } from '../lib/cartHelper';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemWithBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = async () => {
    setIsLoading(true);
    const userId = getAnonymousUserId();

    try {
      const response = await fetch(`/api/cart?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const items: CartItemWithBook[] = await response.json();

      setCartItems(items);

    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const userId = getAnonymousUserId();

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: bookId,
          quantity: newQuantity,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Update local state
      const updatedItems = cartItems.map(item =>
        item.book.id === bookId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);

      // Notify navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (bookId: string) => {
    const userId = getAnonymousUserId();

    try {
      const response = await fetch(`/api/cart?userId=${userId}&bookId=${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Update local state
      const updatedItems = cartItems.filter(item => item.book.id !== bookId);
      setCartItems(updatedItems);

      // Notify navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));

    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    const userId = getAnonymousUserId();
    try {
      const response = await fetch(`/api/cart?userId=${userId}&clear=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCartItems([]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));

    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

  if (isLoading) {
    return <div className="text-center py-10">Loading Cart...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md">
            {cartItems.map((item) => (
              <CartItem
                key={item.book.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            ))}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center text-xl font-bold mb-4 text-gray-800">
              <span>Total: ${totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1 bg-gray-500 text-white text-center py-3 rounded-md hover:bg-gray-600 transition-colors cursor-pointer">
                Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="flex-1 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
