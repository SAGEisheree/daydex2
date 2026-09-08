'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { JournalEntryDialog } from './journal-entry-dialog';

interface JournalCalendarProps {
  profileId: string;
  isOwner: boolean;
  username: string;
  initialDate?: string;
}

export function JournalCalendar({ profileId, isOwner, username, initialDate }: JournalCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [date, setDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : new Date()
  );
  
  const [entryDates, setEntryDates] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(!!initialDate);
  const [currentEntry, setCurrentEntry] = useState<any>(null);

  useEffect(() => {
    fetchEntryDates();
  }, [profileId]);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsed = new Date(dateParam + 'T00:00:00');
      setDate(parsed);
      setIsDialogOpen(true);
      fetchEntryForDate(dateParam);
    } else {
      setIsDialogOpen(false);
    }
  }, [searchParams]);

  async function fetchEntryDates() {
    // Only fetch dates to show indicators on the calendar
    const { data } = await supabase
      .from('journal_entries')
      .select('date')
      .eq('user_id', profileId);
    
    if (data) {
      setEntryDates(data.map(d => new Date(d.date + 'T00:00:00')));
    }
  }

  async function fetchEntryForDate(dateString: string) {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', profileId)
      .eq('date', dateString)
      .single();
    
    setCurrentEntry(data || null);
  }

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setIsDialogOpen(true);
    
    // Format to local YYYY-MM-DD
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    fetchEntryForDate(dateStr);
    router.push(`${pathname}?date=${dateStr}`, { scroll: false });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    router.push(pathname, { scroll: false });
  };

  return (
    <>
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Journal</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="rounded-md border border-zinc-200 w-fit p-4 bg-white"
            modifiers={{
              hasEntry: entryDates,
            }}
            modifiersStyles={{
              hasEntry: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                textDecorationColor: '#18181b',
                textUnderlineOffset: '4px',
              }
            }}
          />
        </CardContent>
      </Card>

      <JournalEntryDialog 
        isOpen={isDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
        date={date}
        entry={currentEntry}
        isOwner={isOwner}
        profileId={profileId}
        onSaved={() => {
          fetchEntryDates();
          fetchEntryForDate(searchParams.get('date')!);
        }}
      />
    </>
  );
}
