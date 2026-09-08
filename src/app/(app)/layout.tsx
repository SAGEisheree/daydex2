import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { NotificationsDropdown } from '@/components/notifications-dropdown';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const username = profile?.username || '';
  const avatarUrl = profile?.avatar_url || '';
  const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href={`/p/${username}`} className="flex items-center gap-2">
              <span className="font-bold tracking-tight">DayDex</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link href={`/p/${username}`} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Journal
              </Link>
              <Link href="/social/friends" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Friends
              </Link>
              <Link href="/social/public" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Explore
              </Link>
              <Link href="/chat" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                Chat
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-8 w-8 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 border-0 bg-transparent p-0 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-zinc-500">
                      @{username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/p/${username}`} className="w-full outline-none">
                  <DropdownMenuItem>Profile & Journal</DropdownMenuItem>
                </Link>
                <Link href="/settings/profile" className="w-full outline-none">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <form action={logout} className="w-full">
                  <button type="submit" className="w-full text-left outline-none cursor-pointer">
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
