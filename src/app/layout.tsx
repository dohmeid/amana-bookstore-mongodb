import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from './components/Navbar';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Amana Bookstore',
  description: 'A modern online bookstore built with Next.js and Tailwind CSS.',
};

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Amana Bookstore. All rights reserved.
        <p className="mt-1">A demo project.</p>
      </div>
    </footer>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50`}>
        <Navbar />
        <div className="flex flex-col min-h-screen pt-16">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}