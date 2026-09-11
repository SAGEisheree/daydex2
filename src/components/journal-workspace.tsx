'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { TodoList } from '@/components/todo-list';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { X, Edit2, Loader2, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface JournalWorkspaceProps {
  profileId: string;
  isOwner: boolean;
  username: string;
  initialDate?: string;
}

export function JournalWorkspace({ profileId, isOwner, username, initialDate }: JournalWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [date, setDate] = useState<Date>(
    initialDate ? new Date(initialDate + 'T00:00:00') : new Date()
  );

  const [entryDates, setEntryDates] = useState<Date[]>([]);
  const [currentEntry, setCurrentEntry] = useState<any>(null);

  // Writer form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(false);
  const [fetchingEntry, setFetchingEntry] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchEntryDates();
  }, [profileId]);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsed = new Date(dateParam + 'T00:00:00');
      setDate(parsed);
      fetchEntryForDate(dateParam);
    } else {
      const todayStr = format(date, 'yyyy-MM-dd');
      fetchEntryForDate(todayStr);
    }
  }, [searchParams]);

  async function fetchEntryDates() {
    const { data } = await supabase
      .from('journal_entries')
      .select('date')
      .eq('user_id', profileId);

    if (data) {
      setEntryDates(data.map(d => new Date(d.date + 'T00:00:00')));
    }
  }

  async function fetchEntryForDate(dateString: string) {
    setFetchingEntry(true);
    setSaveSuccess(false);

    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', profileId)
      .eq('date', dateString)
      .maybeSingle();

    setCurrentEntry(data || null);

    if (data) {
      setTitle(data.title || '');
      setContent(data.content || '');
      setVisibility(data.visibility || 'private');
      setIsEditing(false);
    } else {
      setTitle('');
      setContent('');
      setVisibility('private');
      setIsEditing(true);
    }
    setFetchingEntry(false);
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    fetchEntryForDate(dateStr);
    router.push(`${pathname}?date=${dateStr}`, { scroll: false });
  };

  const handleSave = async () => {
    if (!date || !isOwner) return;
    setLoading(true);
    setSaveSuccess(false);

    const dateStr = format(date, 'yyyy-MM-dd');
    const entryData = {
      user_id: profileId,
      date: dateStr,
      title,
      content,
      visibility,
      allow_comments: true,
    };

    if (currentEntry) {
      await supabase.from('journal_entries').update(entryData).eq('id', currentEntry.id);
    } else {
      await supabase.from('journal_entries').insert([entryData]);
    }

    setLoading(false);
    setIsEditing(false);
    setSaveSuccess(true);
    fetchEntryDates();
    fetchEntryForDate(dateStr);
  };

  const handleCancel = () => {
    if (currentEntry) {
      setTitle(currentEntry.title || '');
      setContent(currentEntry.content || '');
      setVisibility(currentEntry.visibility || 'private');
      setIsEditing(false);
    } else {
      setTitle('');
      setContent('');
    }
  };

  const formattedDate = date ? format(date, 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 sm:p-6 md:p-8 pl-7 sm:pl-10 md:pl-12">
      {/* Notebook Binder Hole Punches */}
      <div className="absolute left-2 sm:left-3.5 top-0 bottom-0 py-4 sm:py-6 flex flex-col justify-between items-center pointer-events-none z-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#d5e2ec] border border-[#c2d4e3] shadow-inner"
          />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Left Column: Inline Entry Writer */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="bg-[#edf2f7] rounded-xl p-3 sm:p-5 border border-slate-200/60 shadow-xs flex flex-col min-h-[380px] sm:min-h-[440px]">
            {fetchingEntry ? (
              <div className="flex-1 bg-white rounded-lg p-8 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
                <Loader2 className="w-6 h-6 animate-spin text-[#2D6BD8]" />
                <span className="text-xs">Loading entry...</span>
              </div>
            ) : isEditing && isOwner ? (
              /* Inline Entry Writer Form */
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col flex-1 space-y-4">
                {/* Header bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-serif font-bold text-base sm:text-lg text-slate-800 tracking-wide">
                    {formattedDate}
                  </span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md cursor-pointer"
                    title="Close / Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title (Optional) */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Title (Optional)</Label>
                  <Input
                    placeholder="Give this entry a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 border-0 border-b border-slate-200 focus-visible:ring-0 focus-visible:border-slate-400 rounded-none px-0 py-1 bg-transparent shadow-none"
                  />
                </div>

                {/* Content area */}
                <div className="flex-1 flex flex-col space-y-1">
                  <Textarea
                    placeholder="Write your thoughts..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 min-h-[160px] sm:min-h-[200px] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border-0 focus-visible:ring-0 shadow-none resize-none px-0 py-1 bg-transparent leading-relaxed"
                  />
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-slate-600">Visibility:</Label>
                    <Select value={visibility} onValueChange={(v) => v && setVisibility(v)}>
                      <SelectTrigger className="w-[110px] h-8 text-xs bg-white border border-slate-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">private</SelectItem>
                        <SelectItem value="friends">friends</SelectItem>
                        <SelectItem value="public">public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={loading || !content.trim()}
                      className="bg-[#707070] hover:bg-[#585858] text-white font-medium text-xs rounded-full px-5 py-1.5 h-8 transition-colors shadow-xs cursor-pointer"
                    >
                      {loading ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : currentEntry ? (
              /* View Saved Entry */
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 sm:p-6 flex flex-col flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base sm:text-lg text-slate-800">
                      {formattedDate}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
                      {currentEntry.visibility}
                    </span>
                  </div>

                  {isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 text-xs gap-1.5 border-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Entry
                    </Button>
                  )}
                </div>

                {currentEntry.title && (
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">{currentEntry.title}</h2>
                )}

                <div className="flex-1 prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentEntry.content}
                </div>

                {saveSuccess && (
                  <p className="text-xs text-emerald-600 font-medium">✓ Entry saved successfully!</p>
                )}
              </div>
            ) : (
              /* Empty state */
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <Sparkles className="w-8 h-8 opacity-40 text-slate-500" />
                <p className="text-xs sm:text-sm font-medium text-slate-600">No entry recorded for {formattedDate}.</p>
                {isOwner && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#2D6BD8] hover:bg-[#255bc0] text-white text-xs rounded-full px-5 py-2 cursor-pointer"
                  >
                    Write an Entry
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calendar & Goals & Tasks */}
        <div className="w-full lg:w-[340px] xl:w-[370px] shrink-0 space-y-6">
          {/* Box 1: Calendar */}
          <div className="bg-[#edf2f7] rounded-xl p-3 sm:p-4 border border-slate-200/60 shadow-xs flex flex-col items-center overflow-x-auto">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="w-full p-1 sm:p-2 bg-transparent border-0"
              classNames={{
                month_caption: "flex justify-center items-center py-2 font-serif font-bold text-slate-800 text-base sm:text-lg",
                caption_label: "font-serif font-bold text-slate-800 text-base",
                nav: "flex items-center justify-between w-full absolute top-2 inset-x-0 px-2",
                weekday: "text-slate-500 font-medium text-xs text-center py-1.5",
                day: "h-8 w-8 sm:h-9 sm:w-9 text-xs p-0 font-medium aria-selected:opacity-100 hover:bg-slate-200/80 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                today: "font-bold text-[#2D6BD8]",
              }}
              modifiers={{
                hasEntry: entryDates,
              }}
              modifiersStyles={{
                hasEntry: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: '#2D6BD8',
                  textUnderlineOffset: '3px',
                },
              }}
            />
          </div>

          {/* Box 2: Goals & Tasks */}
          <TodoList userId={profileId} isOwner={isOwner} />
        </div>
      </div>
    </div>
  );
}
