import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfaqalqnrwevpzgxbiws.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFhbHFucndldnB6Z3hiaXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxOTI2NDksImV4cCI6MjA5Nzc2ODY0OX0.xFLqEc1rI0Ik4mZPFMVYgmzKYn5DfBrv_MvLSpYdzGY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);