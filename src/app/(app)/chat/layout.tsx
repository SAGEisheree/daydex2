import { createClient, getAuthUser } from '@/utils/supabase/server';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  if (!user) return null;

  const supabase = await createClient();

  // Fetch all conversations for the user
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      user1_id,
      user2_id
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Now fetch the profiles for the other users in each conversation
  const otherUserIds = conversations?.map(c => c.user1_id === user.id ? c.user2_id : c.user1_id) || [];
  
  let profiles: any[] = [];
  if (otherUserIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);
    if (data) profiles = data;
  }

  const getProfile = (id: string) => profiles.find(p => p.id === id);

  return (
    <div className="container mx-auto h-[calc(100vh-3.5rem)] py-4 flex gap-4 max-w-6xl">
      <Card className="w-1/3 flex flex-col overflow-hidden border-zinc-200">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="font-bold text-lg">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations && conversations.length > 0 ? (
            conversations.map(conv => {
              const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
              const profile = getProfile(otherUserId);
              if (!profile) return null;
              
              const initials = profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'U';
              
              return (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                  <div className="flex items-center gap-3 p-4 hover:bg-zinc-50 border-b border-zinc-100 transition-colors">
                    <Avatar>
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{profile.full_name}</p>
                      <p className="text-xs text-zinc-500 truncate">@{profile.username}</p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-4 text-center text-zinc-500 text-sm">
              No conversations yet. Start one from a friend's profile!
            </div>
          )}
        </div>
      </Card>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
