import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { revalidatePath } from 'next/cache';

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  async function updateProfile(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const fullName = formData.get('full_name') as string;
    const bio = formData.get('bio') as string;
    const avatarUrl = formData.get('avatar_url') as string;

    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);

    revalidatePath('/settings/profile');
    revalidatePath(`/p/${profile.username}`);
  }

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your public profile details.
        </CardDescription>
      </CardHeader>
      <form action={updateProfile}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input 
              id="full_name" 
              name="full_name" 
              defaultValue={profile?.full_name || ''} 
              className="bg-zinc-50/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              name="bio" 
              defaultValue={profile?.bio || ''} 
              className="bg-zinc-50/50"
              rows={4}
            />
            <p className="text-xs text-zinc-500">
              Write a short bio about yourself.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
            <Input 
              id="avatar_url" 
              name="avatar_url" 
              defaultValue={profile?.avatar_url || ''} 
              className="bg-zinc-50/50"
            />
          </div>

          <Button type="submit" className="mt-4">
            Save Changes
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
