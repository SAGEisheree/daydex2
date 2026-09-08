import Link from 'next/link';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500">Manage your account settings and preferences.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64">
          <nav className="flex flex-col space-y-1">
            <Link 
              href="/settings/profile" 
              className="px-4 py-2 rounded-md hover:bg-zinc-100 text-sm font-medium transition-colors"
            >
              Profile
            </Link>
            <Link 
              href="/settings/export" 
              className="px-4 py-2 rounded-md hover:bg-zinc-100 text-sm font-medium transition-colors"
            >
              Export Data
            </Link>
          </nav>
        </aside>
        
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
