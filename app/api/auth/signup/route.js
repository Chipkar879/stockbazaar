import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { name, email, password, role, schoolCode, documentUrl } = await request.json();

    // 1. Check if student is signing up with a classroom code that actually exists
    if (role === 'student') {
      const { data: codeCheck, error: codeErr } = await supabase
        .from('classrooms')
        .select('class_code')
        .eq('class_code', schoolCode)
        .maybeSingle();

      if (codeErr || !codeCheck) {
        return NextResponse.json({ error: 'Invalid classroom clearance token.' }, { status: 400 });
      }
    }

    // 2. Register the user into Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData?.user) throw new Error('Authentication node drop exception.');

    const userId = authData.user.id;

    // 3. Define adaptive defaults for sandbox cash balance limits
    const initialBalance = (role === 'personal') ? 50000 : 0;
    const isTeacherPending = (role === 'teacher') ? 'pending' : 'approved';
    const isStudentApproved = (role === 'personal'); 

    // 4. Record details directly into the profiles table
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: userId,
      name,
      email,
      role,
      wallet_balance: initialBalance,
      school_id: schoolCode,
      verification_status: isTeacherPending,
      verification_document_url: documentUrl,
      student_approved: isStudentApproved
    }]);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, user: userId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}