'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, UserX, Loader2, UserPlus } from 'lucide-react';
import { acceptFriendRequest, declineFriendRequest } from '@/app/actions/friends';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PendingRequestsCardProps {
  initialRequests: any[];
}

export function PendingRequestsCard({ initialRequests }: PendingRequestsCardProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  if (requests.length === 0) return null;

  const handleAccept = async (requesterId: string) => {
    setProcessingId(requesterId);
    try {
      await acceptFriendRequest(requesterId);
      setRequests(prev => prev.filter(r => r.requesterId !== requesterId));
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requesterId: string) => {
    setProcessingId(requesterId);
    try {
      await declineFriendRequest(requesterId);
      setRequests(prev => prev.filter(r => r.requesterId !== requesterId));
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card className="mb-8 border-amber-200 bg-amber-50/30 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-900">
          <UserPlus className="w-4 h-4 text-amber-600" />
          Pending Friend Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map(req => {
          const profile = req.profile;
          const isProcessing = processingId === req.requesterId;
          const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'U';

          return (
            <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-100 shadow-2xs">
              <Link href={`/p/${profile.username}`} className="flex items-center gap-3 min-w-0 group">
                <Avatar className="h-10 w-10 border border-zinc-200">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 group-hover:underline truncate">
                    {profile.full_name || profile.username}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">@{profile.username}</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(req.requesterId)}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>Accept</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(req.requesterId)}
                  disabled={isProcessing}
                  className="border-zinc-200 text-zinc-600 hover:text-red-600 hover:bg-red-50 text-xs"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Decline</span>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
