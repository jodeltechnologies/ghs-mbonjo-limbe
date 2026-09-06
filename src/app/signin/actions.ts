'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export async function signIn(formData: FormData) {
  const db = supabaseServer();
  const { error } = await db.auth.signInWithPassword({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });
  if (error) redirect('/signin?error=1');
  redirect(String(formData.get('next') ?? '/portal'));
}

export async function signOut() {
  const db = supabaseServer();
  await db.auth.signOut();
  redirect('/');
}
