import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileHeader } from '@/components/profile-header';
import { JournalCalendar } from '@/components/journal-calendar';
import { TodoList } from '@/components/todo-list';

export default async function ProfilePage(props: { params: Promise<{ username: string }>, searchParams: Promise<{ date?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // Fetch the profile for this page
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) {
    notFound();
  }

  // Get current auth user to determine permissions
  const { data: { user } } = await supabase.auth.getUser();
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
      // If not owner, RLS will automatically restrict this count to public/friends entries
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info & ToDos */}
        <div className="space-y-8 lg:col-span-1">
          <ProfileHeader 
            profile={profile} 
            isOwner={isOwner} 
            friendsCount={friendsCount || 0}
            entriesCount={entriesCount || 0}
          />
          
          {isOwner && (
            <TodoList userId={profile.id} />
          )}
        </div>

        {/* Right Column: Calendar & Entries */}
        <div className="lg:col-span-2 space-y-8">
          <JournalCalendar 
            profileId={profile.id} 
            isOwner={isOwner} 
            username={profile.username}
            initialDate={searchParams.date}
          />
        </div>

      </div>
    </div>
  );
}
