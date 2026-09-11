import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const username = profile?.username || '';
  const avatarUrl = profile?.avatar_url || '';
  const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex min-h-screen flex-col bg-[#eaf1f7]">
      <Navbar
        username={username}
        avatarUrl={avatarUrl}
        initials={initials}
        fullName={profile?.full_name || username}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

