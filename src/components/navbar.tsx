'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout } from '@/app/actions/auth';

interface NavbarProps {
  username: string;
  avatarUrl?: string;
  initials: string;
  fullName?: string;
}

export function Navbar({ username, avatarUrl, initials, fullName }: NavbarProps) {
  const pathname = usePathname();

  const isHome =
    pathname === '/' ||
    pathname === '/p' ||
    (username ? pathname.startsWith(`/p/${username}`) : pathname.startsWith('/p/'));
  
  const isSocial = pathname.startsWith('/social');
  const isSettings = pathname.startsWith('/settings');
  const isChat = pathname.startsWith('/chat');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#e9f0f6] border-b border-[#d8e4ee] px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3.5 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        {/* Left: Brand Logo */}
        <Link href={username ? `/p/${username}` : '/'} className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="DayDex"
            width={180}
            height={50}
            priority
            className="h-7 sm:h-9 md:h-10 w-auto object-contain"
          />
        </Link>

        {/* Right: Navigation Links + User actions */}
        <div className="flex items-center gap-3 sm:gap-6 md:gap-10">
          <nav className="flex items-center gap-3 sm:gap-6 md:gap-10 font-serif">
            <Link
              href={username ? `/p/${username}` : '/'}
              className={`text-sm sm:text-base md:text-lg font-bold tracking-wide transition-colors ${
                isHome
                  ? 'text-[#2D6BD8]'
                  : 'text-[#5b6878] hover:text-[#2D6BD8]'
              }`}
            >
              Home
            </Link>

            <Link
              href="/social/friends"
              className={`text-sm sm:text-base md:text-lg font-bold tracking-wide transition-colors ${
                isSocial
                  ? 'text-[#2D6BD8]'
                  : 'text-[#5b6878] hover:text-[#2D6BD8]'
              }`}
            >
              Social
            </Link>

            <Link
              href="/chat"
              className={`hidden md:inline-block text-sm sm:text-base md:text-lg font-bold tracking-wide transition-colors ${
                isChat
                  ? 'text-[#2D6BD8]'
                  : 'text-[#5b6878] hover:text-[#2D6BD8]'
              }`}
            >
              Chat
            </Link>

            <Link
              href="/settings/profile"
              className={`text-sm sm:text-base md:text-lg font-bold tracking-wide transition-colors ${
                isSettings
                  ? 'text-[#2D6BD8]'
                  : 'text-[#5b6878] hover:text-[#2D6BD8]'
              }`}
            >
              Settings
            </Link>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-3 border-l border-[#cde0ee]">
            <NotificationsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6BD8] border-0 bg-transparent p-0 cursor-pointer">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-white/80 shadow-xs">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className="bg-[#2D6BD8] text-white font-medium text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{fullName}</p>
                    <p className="text-xs leading-none text-zinc-500">@{username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={username ? `/p/${username}` : '/'} className="w-full outline-none">
                  <DropdownMenuItem className="cursor-pointer">Profile & Journal</DropdownMenuItem>
                </Link>
                <Link href="/chat" className="w-full outline-none md:hidden">
                  <DropdownMenuItem className="cursor-pointer">Chat</DropdownMenuItem>
                </Link>
                <Link href="/settings/profile" className="w-full outline-none">
                  <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <form action={logout} className="w-full">
                  <button type="submit" className="w-full text-left outline-none cursor-pointer">
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                      Log out
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
