import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function Login(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md shadow-sm border-zinc-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-center">
            Welcome back to DayDex
          </CardTitle>
          <CardDescription className="text-center text-zinc-500">
            Enter your email and password to sign in to your journal.
          </CardDescription>
        </CardHeader>
        <form action={login}>
          <CardContent className="space-y-4">
            {searchParams?.message && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md">
                {searchParams.message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-zinc-50/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-zinc-50/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <div className="text-center text-sm text-zinc-500">
              Don't have an account?{' '}
              <Link href="/signup" className="text-zinc-900 underline hover:text-zinc-700">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
