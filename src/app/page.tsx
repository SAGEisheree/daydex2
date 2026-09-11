import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileUrl = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    if (profile?.username) {
      profileUrl = `/p/${profile.username}`;
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#eaf1f7]">
      <header className="px-4 sm:px-8 lg:px-12 py-3.5 flex items-center border-b border-[#d8e4ee] bg-[#e9f0f6]">
        <Link className="flex items-center gap-2" href="/">
          <Image
            src="/logo.svg"
            alt="DayDex"
            width={180}
            height={50}
            priority
            className="h-8 sm:h-9 md:h-10 w-auto object-contain"
          />
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          {user ? (
            <Link href={profileUrl || '/login'}>
              <Button className="bg-[#2D6BD8] hover:bg-[#255bc0] text-white font-medium" size="sm">Go to Journal</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-slate-700 hover:text-[#2D6BD8]" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#2D6BD8] hover:bg-[#255bc0] text-white font-medium" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Life, Documented.
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400">
                  A calm, minimalist social journaling platform. Keep your thoughts private, share them with friends, or publish them to the world.
                </p>
              </div>
              <div className="space-x-4 mt-8">
                {user ? (
                  <Link href={profileUrl || '/login'}>
                    <Button size="lg">Open your Journal</Button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <Button size="lg">Start Journaling for free</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white border-t border-zinc-200">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 className="text-xl font-bold">Privacy First</h3>
                <p className="text-sm text-zinc-500">Your entries are private by default. You control who sees your thoughts.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3 className="text-xl font-bold">Social Sharing</h3>
                <p className="text-sm text-zinc-500">Connect with friends, share specific entries, and react to their updates.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                </div>
                <h3 className="text-xl font-bold">Interactive Calendar</h3>
                <p className="text-sm text-zinc-500">Visualize your journaling habit with a beautiful, intuitive calendar view.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-zinc-200 bg-white">
        <p className="text-xs text-zinc-500">
          &copy; 2026 DayDex. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
