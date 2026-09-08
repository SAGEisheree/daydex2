'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { SendHorizontal } from 'lucide-react';

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  otherProfile: any;
}

export function ChatInterface({ conversationId, currentUserId, otherProfile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime messages for this conversation
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // If the message is from the other user, add it
          if (payload.new.sender_id !== currentUserId) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage,
    };

    setNewMessage('');
    
    // Optimistic UI
    const tempId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: tempId, ...messageData, created_at: new Date().toISOString() }]);

    const { data } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (data) {
      setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-400">
            Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-zinc-900 text-white rounded-br-none' 
                      : 'bg-zinc-100 text-zinc-900 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 px-1">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </span>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-4 border-t border-zinc-100 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-zinc-50"
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={!newMessage.trim()}>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
