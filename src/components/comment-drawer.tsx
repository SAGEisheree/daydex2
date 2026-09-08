'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  currentUserId: string;
}

export function CommentDrawer({ isOpen, onClose, entryId, currentUserId }: CommentDrawerProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, entryId]);

  async function fetchComments() {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('entry_id', entryId)
      .order('created_at', { ascending: true });
    
    if (data) setComments(data);
    setLoading(false);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      entry_id: entryId,
      author_id: currentUserId,
      content: newComment,
    };

    setNewComment('');
    
    // Get optimistic profile (fake profile for immediate UI update)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();

    const tempId = crypto.randomUUID();
    setComments([...comments, { id: tempId, ...commentData, profiles: profile, created_at: new Date().toISOString() }]);

    const { data } = await supabase
      .from('comments')
      .insert([commentData])
      .select('*, profiles(*)')
      .single();

    if (data) {
      setComments(prev => prev.map(c => c.id === tempId ? data : c));
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b border-zinc-100">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="text-center text-zinc-500 py-10">
              No comments yet. Be the first!
            </div>
          ) : (
            comments.map((comment) => {
              const author = comment.profiles;
              const initials = author?.full_name ? author.full_name.substring(0, 2).toUpperCase() : author?.username?.substring(0, 2).toUpperCase();
              
              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={author?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{author?.full_name}</span>
                      <span className="text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-800 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-white"
            />
            <Button type="submit" disabled={!newComment.trim()}>Post</Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
