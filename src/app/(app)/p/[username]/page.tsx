import { createClient, getAuthUser } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileHeader } from '@/components/profile-header';
import { JournalWorkspace } from '@/components/journal-workspace';

export default async function ProfilePage(props: { params: Promise<{ username: string }>, searchParams: Promise<{ date?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // Concurrently fetch profile and current auth user
  const [{ data: profile }, user] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('username', params.username)
      .single(),
    getAuthUser(),
  ]);

  if (!profile) {
    notFound();
  }

  const isOwner = user?.id === profile.id;

  // Fetch basic stats (friends count, entries count, etc)
  const [{ count: friendsCount }, { count: entriesCount }] = await Promise.all([
    supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
      .eq('status', 'accepted'),
    supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* 1st Section: About / Profile Header */}
      <ProfileHeader 
        profile={profile} 
        isOwner={isOwner} 
        friendsCount={friendsCount || 0}
        entriesCount={entriesCount || 0}
      />
      
      {/* 2nd Section: Workspace with Inline Writer + Calendar + Goals & Tasks */}
      <JournalWorkspace 
        profileId={profile.id}
        isOwner={isOwner}
        username={profile.username}
        initialDate={searchParams.date}
      />
    </div>
  );
}

