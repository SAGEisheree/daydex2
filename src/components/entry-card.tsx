'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CommentDrawer } from './comment-drawer';

interface EntryCardProps {
  entry: any; // includes profiles and bookmarks
  currentUserId: string;
}

export function EntryCard({ entry, currentUserId }: EntryCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(entry.bookmarks?.some((b: any) => b.user_id === currentUserId) || false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const supabase = createClient();

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked); // optimistic

    if (!isBookmarked) {
      await supabase.from('bookmarks').insert([{ user_id: currentUserId, entry_id: entry.id }]);
    } else {
      await supabase.from('bookmarks').delete().match({ user_id: currentUserId, entry_id: entry.id });
    }
  };

  const timeAgo = formatDistanceToNow(new Date(entry.created_at), { addSuffix: true });
  const author = entry.profiles;
  const initials = author.full_name ? author.full_name.substring(0, 2).toUpperCase() : author.username.substring(0, 2).toUpperCase();

  return (
    <>
      <Card className="mb-6 shadow-sm border-zinc-200">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Link href={`/p/${author.username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar_url || ''} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link href={`/p/${author.username}`} className="font-semibold hover:underline">
              {author.full_name}
            </Link>
            <span className="text-xs text-zinc-500">{timeAgo} • {entry.visibility}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          {entry.title && <h3 className="font-bold text-lg">{entry.title}</h3>}
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-zinc-800">
            {entry.content}
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-4 border-t border-zinc-100 pt-4 text-zinc-500">
          <Button variant="ghost" size="sm" className="gap-2 px-2 hover:text-red-600 hover:bg-red-50">
            <Heart className="w-4 h-4" />
            <span>Like</span>
          </Button>
          
          {entry.allow_comments && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 px-2 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setIsCommentDrawerOpen(true)}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Comment</span>
            </Button>
          )}

          <div className="flex-1" />

          <Button 
            variant="ghost" 
            size="icon" 
            className={`hover:bg-zinc-100 ${isBookmarked ? 'text-zinc-900 fill-zinc-900' : ''}`}
            onClick={handleBookmark}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </CardFooter>
      </Card>

      <CommentDrawer 
        isOpen={isCommentDrawerOpen} 
        onClose={() => setIsCommentDrawerOpen(false)} 
        entryId={entry.id} 
        currentUserId={currentUserId}
      />
    </>
  );
}
