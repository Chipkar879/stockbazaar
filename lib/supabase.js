import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfaqalqnrwevpzgxbiws.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFhbHFucndldnB6Z3hiaXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxOTI2NDksImV4cCI6MjA5Nzc2ODY0OX0.xFLqEc1rI0Ik4mZPFMVYgmzKYn5DfBrv_MvLSpYdzGY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // CRITICAL FIX: Automatically save sessions to cookies so the server middleware can see them
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        // Check cookie first, fallback to local storage
        const value = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${key}=`))
          ?.split('=')[1];
        return value ? decodeURIComponent(value) : window.localStorage.getItem(key);
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, value);
        // Write cookie (expires in 7 days)
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax; Secure`;
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
        // Delete cookie
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
  }
});