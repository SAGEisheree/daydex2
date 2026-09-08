'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Clock, UserX, Loader2 } from 'lucide-react';
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getFriendshipStatus } from '@/app/actions/friends';
import { useRouter } from 'next/navigation';

interface ProfileFriendButtonProps {
  targetUserId: string;
  initialStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
}

export function ProfileFriendButton({ targetUserId, initialStatus }: ProfileFriendButtonProps) {
  const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'loading'>(
    initialStatus || 'loading'
  );
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!initialStatus) {
      getFriendshipStatus(targetUserId).then(res => {
        if (res.status !== 'self') {
          setStatus(res.status);
        }
      });
    }
  }, [targetUserId, initialStatus]);

  async function handleSend() {
    setActionLoading(true);
    try {
      await sendFriendRequest(targetUserId);
      setStatus('pending_sent');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAccept() {
    setActionLoading(true);
    try {
      await acceptFriendRequest(targetUserId);
      setStatus('accepted');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDecline() {
    setActionLoading(true);
    try {
      await declineFriendRequest(targetUserId);
      setStatus('none');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemove() {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    setActionLoading(true);
    try {
      await removeFriend(targetUserId);
      setStatus('none');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
        <span>Loading...</span>
      </Button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRemove}
        disabled={actionLoading}
        title="Click to cancel friend request"
        className="gap-2 border-zinc-300 text-zinc-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 text-amber-500" />}
        <span>Request Sent</span>
      </Button>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          onClick={handleAccept}
          disabled={actionLoading}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
          <span>Accept Request</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDecline}
          disabled={actionLoading}
          className="px-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 border-zinc-200"
          title="Decline Request"
        >
          <UserX className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRemove}
        disabled={actionLoading}
        className="gap-2 border-zinc-200 text-zinc-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Click to unfriend"
      >
        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
        <span>Friends</span>
      </Button>
    );
  }

  // status === 'none'
  return (
    <Button 
      size="sm" 
      onClick={handleSend}
      disabled={actionLoading}
      className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
    >
      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
      <span>Add Friend</span>
    </Button>
  );
}
