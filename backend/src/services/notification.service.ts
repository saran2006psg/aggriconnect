import { supabaseAdmin } from '../lib/supabase';

export async function getNotificationsService(
  userId: string,
  unread: boolean,
  limit: number
) {
  let q = supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unread) q = q.eq('is_read', false);

  const { data } = await q.order('created_at', { ascending: false }).limit(limit);
  return data ?? [];
}

export async function markNotificationReadService(notificationId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select();
  return data?.[0] ?? null;
}

export async function deleteNotificationService(notificationId: string, userId: string) {
  await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);
}

export async function markAllNotificationsReadService(userId: string) {
  const { data } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();
  return data ?? [];
}
