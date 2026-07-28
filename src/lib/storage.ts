// Safe Storage Utility to prevent uncaught DOMException in restricted browser environments
// (e.g. Cloudflare Pages, strict privacy modes, quota exceeded errors)

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to getItem for key "${key}":`, e);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to setItem for key "${key}":`, e);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[safeLocalStorage] Failed to removeItem for key "${key}":`, e);
      return false;
    }
  },
};
