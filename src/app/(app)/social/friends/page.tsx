import { createClient } from '@/utils/supabase/server';
import { EntryCard } from '@/components/entry-card';
import { PendingRequestsCard } from '@/components/pending-requests-card';
import { getPendingFriendRequests } from '@/app/actions/friends';

export const dynamic = 'force-dynamic';

export default async function FriendsFeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [pendingRequests, { data: friendships }] = await Promise.all([
    getPendingFriendRequests(),
    supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
  ]);

  const friendIds = friendships?.map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id) || [];
  
  let entries: any[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from('journal_entries')
      .select('*, profiles!journal_entries_user_id_fkey(*), bookmarks(*)')
      .in('user_id', friendIds)
      .in('visibility', ['friends', 'public'])
      .order('created_at', { ascending: false })
      .limit(50);
    
    entries = data || [];
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Friends Activity</h1>
        <p className="text-zinc-500">See what your friends are writing about.</p>
      </div>

      <PendingRequestsCard initialRequests={pendingRequests} />

      {friendIds.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm">
          <p className="font-medium mb-1">No friends added yet</p>
          <p className="text-sm text-zinc-400">Explore public entries or view other user profiles to add friends!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.length > 0 ? (
            entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} currentUserId={user.id} />
            ))
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm">
              Your friends haven't shared any entries recently.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
