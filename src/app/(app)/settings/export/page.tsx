'use client';

import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';

export default function ExportDataPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleExport = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [profileRes, entriesRes, todosRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('journal_entries').select('*').eq('user_id', user.id),
      supabase.from('todos').select('*').eq('user_id', user.id)
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile: profileRes.data,
      journal_entries: entriesRes.data,
      todos: todosRes.data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daydex_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setLoading(false);
  };

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download a copy of all your journal entries, to-dos, and profile information in JSON format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={loading} className="gap-2">
          <Download className="w-4 h-4" />
          {loading ? 'Preparing Export...' : 'Export as JSON'}
        </Button>
      </CardContent>
    </Card>
  );
}
