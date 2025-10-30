## Amana Bookstore

Modern bookstore demo built with Next.js App Router, React, and Tailwind CSS. It showcases a catalog with filtering, featured carousel, book details with reviews, a MongoDB-backed cart, and API routes.

### Features
- **Catalog UI**: Grid and list views with search, genre filter, sorting, and pagination
- **Featured Carousel**: Simple paged carousel for highlighted books
- **Book Details**: Ratings renderer, genres, price, and a reviews section
- **Cart (MongoDB-backed)**: Cart state is stored in a MongoDB database, associated with an anonymous user ID kept in `localStorage`.
- **API Routes**: Endpoints under `/api/books`, `/api/cart`, and `/api/reviews` connecting to MongoDB.
- **Responsive Design**: Tailwind CSS v4 styles

### Tech Stack
- **Framework**: Next.js 15 App Router (`/src/app`)
- **UI**: React 19 + Tailwind CSS v4
- **Database**: MongoDB (via `mongodb` driver)
- **Language**: TypeScript (strict mode)

---

## Getting Started

**NOTE:** This project requires a MongoDB database.

1) Set up your MongoDB:
   - Create a MongoDB Atlas cluster (or run a local instance).
   - Get your connection string (e.g., `mongodb+srv://...`).

2) Create environment file:
   - Rename `.env.local.example` (if present) to `.env.local`.
   - Add your connection string:
     `MONGODB_URI=your_connection_string_here`
     `MONGODB_DB_NAME=your_database_name_here` (e.g., `bookStoreData`)

3) Install dependencies
```bash
npm install