'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { ProfileFriendButton } from '@/components/profile-friend-button';

interface ProfileHeaderProps {
  profile: any;
  isOwner: boolean;
  friendsCount: number;
  entriesCount: number;
}

export function ProfileHeader({ profile, isOwner, friendsCount, entriesCount }: ProfileHeaderProps) {
  const initials = profile.full_name
    ? profile.full_name.substring(0, 2).toUpperCase()
    : profile.username.substring(0, 2).toUpperCase();

  const defaultBio = "Hello. I am " + (profile.full_name || profile.username) + ". Recording life publicly so we can stay motivated and feel that we aren't alone.";
  const bioText = profile.bio || defaultBio;
  const coverUrl = profile.cover_url || '/cover-leaves.png';

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row pl-7 sm:pl-10 md:pl-12 min-h-[160px]">
      {/* Vertical Notebook Binder Hole Punches */}
      <div className="absolute left-2 sm:left-3.5 top-0 bottom-0 py-3 sm:py-4 flex flex-col justify-between items-center pointer-events-none z-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#d5e2ec] border border-[#c2d4e3] shadow-inner"
          />
        ))}
      </div>

      {/* Left Profile Info Section */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start justify-center">
        <Avatar className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl border border-slate-200 shadow-xs shrink-0 bg-slate-100">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || profile.username} className="object-cover" />
          <AvatarFallback className="rounded-xl text-base sm:text-xl font-bold bg-[#2D6BD8] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-sans truncate">
              {profile.full_name || profile.username}
            </h1>

            {isOwner ? (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg px-2.5">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            ) : (
              <ProfileFriendButton targetUserId={profile.id} />
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-xl">
            {bioText}
          </p>

          <div className="flex items-center gap-3 sm:gap-4 pt-1 text-xs text-slate-500 font-medium">
            <span><strong>{entriesCount}</strong> Entries</span>
            <span>•</span>
            <span><strong>{friendsCount}</strong> Friends</span>
          </div>
        </div>
      </div>

      {/* Right Cover Image Banner */}
      <div className="w-full md:w-5/12 lg:w-1/2 h-36 sm:h-44 md:h-auto shrink-0 relative overflow-hidden bg-slate-100 border-t md:border-t-0 md:border-l border-slate-100">
        <Image
          src={coverUrl}
          alt="Cover banner"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
