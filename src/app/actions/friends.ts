'use me';
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendFriendRequest(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  if (user.id === targetUserId) {
    throw new Error('Cannot send friend request to yourself');
  }

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') {
      return { success: true, message: 'Already friends' };
    }
    // Update existing record
    const { error } = await supabase
      .from('friendships')
      .update({
        requester_id: user.id,
        addressee_id: targetUserId,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (error) throw new Error(error.message);
  } else {
    // Insert new friendship request
    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: targetUserId,
        status: 'pending'
      });

    if (error) throw new Error(error.message);
  }

  revalidatePath('/social/friends');
  revalidatePath(`/p`);
  return { success: true };
}

export async function acceptFriendRequest(requesterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('friendships')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString()
    })
    .eq('requester_id', requesterId)
    .eq('addressee_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/social/friends');
  revalidatePath(`/p`);
  return { success: true };
}

export async function declineFriendRequest(requesterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('friendships')
    .update({
      status: 'declined',
      updated_at: new Date().toISOString()
    })
    .eq('requester_id', requesterId)
    .eq('addressee_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/social/friends');
  return { success: true };
}

export async function removeFriend(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`);

  if (error) {
    // Fallback: update status to declined if delete policy fails
    await supabase
      .from('friendships')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`);
  }

  revalidatePath('/social/friends');
  revalidatePath(`/p`);
  return { success: true };
}

export async function getFriendshipStatus(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'none' as const };
  }

  if (user.id === targetUserId) {
    return { status: 'self' as const };
  }

  const { data: friendship } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
    .maybeSingle();

  if (!friendship || friendship.status === 'declined') {
    return { status: 'none' as const };
  }

  if (friendship.status === 'accepted') {
    return { status: 'accepted' as const };
  }

  if (friendship.status === 'pending') {
    if (friendship.requester_id === user.id) {
      return { status: 'pending_sent' as const };
    } else {
      return { status: 'pending_received' as const };
    }
  }

  return { status: 'none' as const };
}

export async function getPendingFriendRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: requests } = await supabase
    .from('friendships')
    .select('id, requester_id, created_at')
    .eq('addressee_id', user.id)
    .eq('status', 'pending');

  if (!requests || requests.length === 0) return [];

  const requesterIds = requests.map(r => r.requester_id);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', requesterIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return requests.map(req => ({
    id: req.id,
    requesterId: req.requester_id,
    createdAt: req.created_at,
    profile: profileMap.get(req.requester_id) || null
  })).filter(req => req.profile !== null);
}
