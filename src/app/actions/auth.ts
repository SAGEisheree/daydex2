'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?message=Could not authenticate user');
  }

  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.username;

  revalidatePath('/', 'layout');
  if (username) {
    redirect(`/p/${username}`);
  } else {
    redirect('/');
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const fullName = formData.get('full_name') as string;

  const supabase = await createClient();

  // Basic username validation
  if (!username || username.length < 3) {
    return redirect('/signup?message=Username must be at least 3 characters');
  }

  // Check if username is already taken by querying the profiles table
  // (We use service role key or just let the database trigger handle it, but better to check first if possible. 
  // However, without a service key, unauthenticated users can't query profiles if RLS blocks it.
  // Actually, our RLS policy says "Public profiles are viewable by everyone", so we can check it!)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existingProfile) {
    return redirect('/signup?message=Username is already taken');
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      },
    },
  });

  if (error) {
    return redirect('/signup?message=Could not sign up user: ' + error.message);
  }

  revalidatePath('/', 'layout');
  redirect(`/p/${username}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
