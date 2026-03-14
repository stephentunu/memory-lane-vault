import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type MediaItem = Database['public']['Tables']['media_items']['Row'];
export type MediaItemInsert = Database['public']['Tables']['media_items']['Insert'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export const getMediaItems = async (userId: string, type?: string) => {
  let query = supabase.from('media_items').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase.from('media_items').select('*').eq('user_id', userId).eq('is_favorite', true).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createMediaItem = async (item: MediaItemInsert) => {
  const { data, error } = await supabase.from('media_items').insert(item).select().single();
  if (error) throw error;
  return data;
};

export const updateMediaItem = async (id: string, updates: Partial<MediaItemInsert>) => {
  const { data, error } = await supabase.from('media_items').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteMediaItem = async (id: string) => {
  const { error } = await supabase.from('media_items').delete().eq('id', id);
  if (error) throw error;
};

export const toggleFavorite = async (id: string, isFavorite: boolean) => {
  const { data, error } = await supabase.from('media_items').update({ is_favorite: !isFavorite }).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: { vault_name?: string; display_name?: string }) => {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
};

export const getActivityLog = async (userId: string, limit = 7) => {
  const { data, error } = await supabase.from('activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
};

export const logActivity = async (userId: string, action: string, itemTitle?: string, itemType?: string) => {
  await supabase.from('activity_log').insert({ user_id: userId, action, item_title: itemTitle, item_type: itemType });
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return data;
};

export const getSignedUrl = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
};

export const getMediaCounts = async (userId: string) => {
  const { count: videos } = await supabase.from('media_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'video');
  const { count: photos } = await supabase.from('media_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'photo');
  const { count: poems } = await supabase.from('media_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'poem');
  return { videos: videos ?? 0, photos: photos ?? 0, poems: poems ?? 0 };
};
