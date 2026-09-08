import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { Card } from '@/components/ui/card';

export default async function ConversationPage(props: { params: Promise<{ conversationId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Verify user has access to conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', params.conversationId)
    .single();

  if (!conversation || (conversation.user1_id !== user.id && conversation.user2_id !== user.id)) {
    notFound();
  }

  // Get other user's profile
  const otherUserId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', otherUserId)
    .single();

  if (!otherProfile) notFound();

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden border-zinc-200">
      <div className="p-4 border-b border-zinc-100 flex items-center bg-white shadow-sm z-10">
        <h2 className="font-bold text-lg">{otherProfile.full_name}</h2>
        <span className="ml-2 text-sm text-zinc-500">@{otherProfile.username}</span>
      </div>
      <ChatInterface 
        conversationId={params.conversationId} 
        currentUserId={user.id} 
        otherProfile={otherProfile}
      />
    </Card>
  );
}
