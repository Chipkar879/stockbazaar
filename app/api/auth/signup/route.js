import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { name, email, password, role, schoolCode, specificClassId, documentUrl } = await request.json();

    // 1. Check if student is signing up with a school code that actually exists in 'school_classes'
    if (role === 'student') {
      const { data: codeCheck, error: codeErr } = await supabase
        .from('school_classes') // ✅ Correct table name
        .select('school_code')  // ✅ Correct column name
        .eq('school_code', schoolCode ? schoolCode.toUpperCase() : '')
        .limit(1);

      if (codeErr || !codeCheck || codeCheck.length === 0) {
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
    const initialBalance = (role === 'personal' || role === 'student') ? 50000 : 0;
    const isTeacherPending = (role === 'teacher') ? 'pending' : 'approved';
    const isStudentApproved = true; 

    // 4. Record details directly into the profiles table
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: userId,
      name,
      email,
      role,
      wallet_balance: initialBalance,
      net_worth: initialBalance,
      school_code: schoolCode ? schoolCode.toUpperCase() : null,
      specific_class_id: specificClassId ? String(specificClassId) : null,
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