import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { name, email, password, role, schoolCode } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All primary fields are required.' }, { status: 400 });
    }

    // 1. Create a secure login account inside Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Insert custom parameters directly into your database profiles spreadsheet
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role: role, // 'personal', 'student', or 'teacher'
          school_id: role !== 'personal' ? (schoolCode || null) : null,
          wallet_balance: 50000 // Standardized to your target ₹50,000 trading allocation
        }
      ]);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal system registry failure.' }, { status: 500 });
  }
}