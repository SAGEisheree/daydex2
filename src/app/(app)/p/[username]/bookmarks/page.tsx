import { createClient } from '@/utils/supabase/server';
import { EntryCard } from '@/components/entry-card';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BookmarksPage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify the profile matches the logged in user (only owners can see their bookmarks)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', params.username)
    .single();

  if (!profile || profile.id !== user.id) {
    redirect(`/p/${params.username}`);
  }

  // Fetch bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`
      entry_id,
      journal_entries (
        *,
        profiles!journal_entries_user_id_fkey(*),
        bookmarks(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Bookmarks</h1>
        <p className="text-zinc-500">Saved entries from your friends and the public feed.</p>
      </div>
      
      <div className="space-y-6">
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map((bookmark: any) => (
            <EntryCard key={bookmark.entry_id} entry={bookmark.journal_entries} currentUserId={user.id} />
          ))
        ) : (
          <div className="text-center py-20 text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm">
            You haven't bookmarked any entries yet.
          </div>
        )}
      </div>
    </div>
  );
}
