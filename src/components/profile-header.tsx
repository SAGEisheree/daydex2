'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, CalendarDays, Edit3, Settings } from 'lucide-react';
import Link from 'next/link';

import { ProfileFriendButton } from '@/components/profile-friend-button';

interface ProfileHeaderProps {
  profile: any;
  isOwner: boolean;
  friendsCount: number;
  entriesCount: number;
}

export function ProfileHeader({ profile, isOwner, friendsCount, entriesCount }: ProfileHeaderProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const initials = profile.full_name 
    ? profile.full_name.substring(0, 2).toUpperCase() 
    : profile.username.substring(0, 2).toUpperCase();

  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden">
      <div className="h-24 bg-zinc-900 w-full"></div>
      <CardHeader className="relative pb-0 pt-0">
        <div className="flex justify-between items-end -mt-12 mb-4">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm bg-white">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
            <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          
          {isOwner ? (
            <Link href="/settings/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
          ) : (
            <ProfileFriendButton targetUserId={profile.id} />
          )}
        </div>
        
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{profile.full_name}</h2>
          <p className="text-zinc-500">@{profile.username}</p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {profile.bio ? (
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{profile.bio}</p>
        ) : (
          <p className="text-sm text-zinc-400 italic">No bio written yet.</p>
        )}

        <div className="flex flex-col gap-2 pt-2 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>Joined {joinDate}</span>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-zinc-100">
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900">{entriesCount}</span>
            <span className="text-xs text-zinc-500">Entries</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900">{friendsCount}</span>
            <span className="text-xs text-zinc-500">Friends</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
