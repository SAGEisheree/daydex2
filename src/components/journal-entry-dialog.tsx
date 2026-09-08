'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface JournalEntryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | undefined;
  entry: any | null;
  isOwner: boolean;
  profileId: string;
  onSaved: () => void;
}

export function JournalEntryDialog({ 
  isOpen, 
  onOpenChange, 
  date, 
  entry, 
  isOwner,
  profileId,
  onSaved 
}: JournalEntryDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setVisibility(entry.visibility || 'private');
      setIsEditing(false); // If it exists, start in view mode
    } else {
      setTitle('');
      setContent('');
      setVisibility('private');
      setIsEditing(true); // If it doesn't exist, start in edit mode (only works if isOwner)
    }
  }, [entry, isOpen]);

  const handleSave = async () => {
    if (!date) return;
    setLoading(true);

    const dateStr = format(date, 'yyyy-MM-dd');
    
    const entryData = {
      user_id: profileId,
      date: dateStr,
      title,
      content,
      visibility,
      allow_comments: true
    };

    if (entry) {
      // Update
      await supabase.from('journal_entries').update(entryData).eq('id', entry.id);
    } else {
      // Insert
      await supabase.from('journal_entries').insert([entryData]);
    }

    setLoading(false);
    setIsEditing(false);
    onSaved();
    
    // Refresh the router cache to ensure the new entry shows up in feeds
    window.location.reload(); // Hard refresh to guarantee fresh data across all tabs/caches
  };

  const formattedDate = date ? format(date, 'MMMM d, yyyy') : '';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <DialogTitle className="flex items-center justify-between">
            <span>{formattedDate}</span>
            {isOwner && entry && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Entry
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!isOwner && !entry ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              No public entry found for this date.
            </div>
          ) : (
            <div className="space-y-6 h-full flex flex-col">
              {isEditing && isOwner ? (
                <>
                  <div className="space-y-2">
                    <Label>Title (Optional)</Label>
                    <Input 
                      placeholder="Give this entry a title..." 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="text-lg font-medium border-0 px-0 rounded-none border-b border-zinc-200 focus-visible:ring-0 shadow-none bg-transparent"
                    />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col">
                    <Label className="sr-only">Content</Label>
                    <Textarea
                      placeholder="Write your thoughts..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="flex-1 resize-none border-0 px-0 focus-visible:ring-0 shadow-none bg-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  {title && <h2 className="text-2xl font-bold">{title}</h2>}
                  <div className="prose prose-zinc max-w-none flex-1 whitespace-pre-wrap">
                    {content || <span className="text-zinc-400 italic">No content.</span>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing && isOwner && (
          <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Visibility:</Label>
              <Select value={visibility} onValueChange={(v) => v && setVisibility(v)}>
                <SelectTrigger className="w-[120px] h-8 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-x-2">
              <Button variant="ghost" onClick={() => entry ? setIsEditing(false) : onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || !content.trim()}>
                {loading ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
