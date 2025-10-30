import { ObjectId } from 'mongodb';

export interface Book {
  _id: ObjectId; // MongoDB primary key
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  image: string;
  isbn: string;
  genre: string[];
  tags: string[];
  datePublished: string;
  pages: number;
  language: string;
  publisher: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
}

export interface Review {
  _id: ObjectId;
  id: string;
  bookId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  timestamp: string;
  verified: boolean;
}

export interface CartItem {
  _id: ObjectId;
  userId: string; // To associate cart with a user/session
  bookId: string;
  quantity: number;
  addedAt: string;
}

// Type for cart items returned from API (joined with book details)
export interface CartItemWithBook {
  book: Book;
  quantity: number;
  userId: string;
  bookId: string;
  _id: ObjectId;
}