import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function ChatIndexPage() {
  return (
    <Card className="h-full w-full flex flex-col items-center justify-center border-zinc-200 bg-zinc-50/50 text-zinc-400">
      <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
      <p>Select a conversation to start chatting</p>
    </Card>
  );
}
