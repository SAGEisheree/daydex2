'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Image as ImageIcon, BookOpen, Users } from 'lucide-react';
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
    : profile.username ? profile.username.substring(0, 2).toUpperCase() : 'U';

  const defaultBio = "Hello, I am " + (profile.full_name || profile.username || 'a journaler') + ". Welcome to my journal space where I document my life and thoughts.";
  const bioText = profile.bio || defaultBio;
  const coverUrl = profile.cover_url || null;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row pl-7 sm:pl-10 md:pl-12 min-h-[170px] transition-all">
      {/* Notebook Binder Hole Punches */}
      <div className="absolute left-2 sm:left-3.5 top-0 bottom-0 py-3 sm:py-4 flex flex-col justify-between items-center pointer-events-none z-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#d5e2ec] border border-[#c2d4e3] shadow-inner"
          />
        ))}
      </div>

      {/* Left About Section Info */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start justify-center">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-white ring-2 ring-slate-100 shadow-sm shrink-0 bg-slate-100">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || profile.username} className="object-cover" />
          <AvatarFallback className="rounded-2xl text-base sm:text-xl font-bold bg-[#2D6BD8] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2 flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif truncate">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-xs text-slate-500 font-medium">@{profile.username}</p>
            </div>

            {isOwner ? (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200 text-slate-700 hover:text-[#2D6BD8] hover:border-[#2D6BD8]/40 rounded-lg px-3 shadow-xs">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            ) : (
              <ProfileFriendButton targetUserId={profile.id} />
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
            {bioText}
          </p>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-[#2D6BD8]" />
              {entriesCount} {entriesCount === 1 ? 'Entry' : 'Entries'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              <Users className="w-3.5 h-3.5 text-[#2D6BD8]" />
              {friendsCount} {friendsCount === 1 ? 'Friend' : 'Friends'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Banner Image / Banner Link Placeholder */}
      <div className="w-full md:w-5/12 lg:w-1/2 h-36 sm:h-44 md:h-auto shrink-0 relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 border-t md:border-t-0 md:border-l border-slate-100 group">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt="Cover banner"
            fill
            priority
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-slate-200/80 rounded-r-2xl m-2 bg-white/40 backdrop-blur-xs">
            <div className="p-2.5 rounded-full bg-slate-100 text-slate-400 group-hover:text-[#2D6BD8] group-hover:bg-blue-50 transition-colors mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600">Banner Image Placeholder</p>
            <p className="text-[11px] text-slate-400 max-w-[200px] mt-0.5">
              {isOwner ? 'Add a banner image URL in settings' : 'No banner image set'}
            </p>

            {isOwner && (
              <Link href="/settings/profile" className="mt-2">
                <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#2D6BD8] hover:bg-blue-50 px-2.5 font-medium">
                  + Add Banner URL
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

