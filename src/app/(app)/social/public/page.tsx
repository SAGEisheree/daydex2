import { createClient } from '@/utils/supabase/server';
import { EntryCard } from '@/components/entry-card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicFeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*, profiles!journal_entries_user_id_fkey(*), bookmarks(*)')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Public Explore</h1>
        <p className="text-zinc-500">Discover public journal entries from around the world.</p>
      </div>
      
      <div className="space-y-6">
        {entries && entries.length > 0 ? (
          entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} currentUserId={user.id} />
          ))
        ) : (
          <div className="text-center py-20 text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm">
            No public entries found. Be the first to share!
          </div>
        )}
      </div>
    </div>
  );
}
