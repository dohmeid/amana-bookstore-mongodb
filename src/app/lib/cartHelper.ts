'use client';

const CART_USER_ID_KEY = 'bookstore_anonymous_user_id';

/**
 * Gets a persistent anonymous user ID from localStorage.
 * If one doesn't exist, it creates one using crypto.randomUUID.
 */
export const getAnonymousUserId = (): string => {
  if (typeof window === 'undefined') {
    console.warn('getAnonymousUserId called on the server.');
    return '';
  }

  let userId = localStorage.getItem(CART_USER_ID_KEY);

  if (!userId) {
    try {
      // Uses the modern crypto.randomUUID() to generate a unique ID
      userId = crypto.randomUUID();
      localStorage.setItem(CART_USER_ID_KEY, userId);
    } catch (error) {
      console.error('Failed to generate or store anonymous user ID:', error);
      // Fallback in case of storage failure or no crypto
      userId = `fallback_user_${new Date().getTime()}`;
    }
  }

  return userId;
};