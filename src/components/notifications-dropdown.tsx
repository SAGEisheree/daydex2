'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, UserCheck, UserX, Loader2 } from 'lucide-react';
import { getPendingFriendRequests, acceptFriendRequest, declineFriendRequest } from '@/app/actions/friends';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NotificationsDropdown() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      const data = await getPendingFriendRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const pendingCount = requests.length;

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <Button 
            {...props}
            variant="ghost" 
            size="icon" 
            className="relative text-zinc-600 hover:text-zinc-900 rounded-full h-8 w-8"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-in zoom-in-50">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Button>
        )}
      />
      
      <PopoverContent className="w-80 p-0 shadow-lg border-zinc-200" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
          <h4 className="font-semibold text-sm text-zinc-900">Notifications</h4>
          {pendingCount > 0 && (
            <span className="text-xs bg-zinc-200 text-zinc-700 font-medium px-2 py-0.5 rounded-full">
              {pendingCount} new
            </span>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
          {loading ? (
            <div className="flex items-center justify-center p-6 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-xs">Loading requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No pending friend requests.</p>
            </div>
          ) : (
            requests.map(req => {
              const isProcessing = processingId === req.requesterId;
              const profile = req.profile;
              const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'U';

              return (
                <div key={req.id} className="p-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <Link 
                    href={`/p/${profile.username}`} 
                    className="flex items-center gap-3 min-w-0 pr-2 group"
                  >
                    <Avatar className="h-9 w-9 shrink-0 border border-zinc-200">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 truncate group-hover:underline">
                        {profile.full_name || profile.username}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        @{profile.username}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(req.requesterId)}
                      disabled={isProcessing}
                      className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                      <span>Accept</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDecline(req.requesterId)}
                      disabled={isProcessing}
                      className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      title="Decline"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-2 border-t border-zinc-100 bg-zinc-50/50 text-center">
          <Link href="/social/friends" className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900">
            View all friends activity →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
