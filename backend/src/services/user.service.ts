import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { UserUpdateRequest, AddressCreateRequest, AddressUpdateRequest } from '../types/user.types';
import { ServiceResult } from '../utils/response';

export async function updateProfileService(userId: string, body: UserUpdateRequest): Promise<ServiceResult> {
  const updateFields: Record<string, unknown> = {};
  const keys = Object.keys(body) as (keyof UserUpdateRequest)[];
  for (const key of keys) {
    if (body[key] !== undefined) updateFields[key] = body[key];
  }

  if (Object.keys(updateFields).length === 0) {
    return { success: false, message: 'No fields to update', errors: { update: 'No data provided' } };
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateFields)
    .eq('id', userId)
    .select();

  if (error) throw new Error(error.message);

  const updated = data?.[0] ?? null;
  if (updated) delete updated.password_hash;

  return { success: true, message: 'Profile updated successfully', data: updated };
}

export async function getAddressesService(userId: string) {
  const { data } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', userId);
  return data ?? [];
}

export async function createAddressService(userId: string, body: AddressCreateRequest) {
  if (body.is_default) {
    await supabaseAdmin
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .insert({
      id: uuidv4(),
      user_id: userId,
      ...body,
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function updateAddressService(
  addressId: string,
  userId: string,
  body: AddressUpdateRequest
) {
  const { data: existing } = await supabaseAdmin
    .from('addresses')
    .select('user_id')
    .eq('id', addressId)
    .single();

  if (!existing || existing.user_id !== userId) return { found: false };

  if (body.is_default) {
    await supabaseAdmin
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const updateFields: Record<string, unknown> = {};
  const keys = Object.keys(body) as (keyof AddressUpdateRequest)[];
  for (const key of keys) {
    if (body[key] !== undefined) updateFields[key] = body[key];
  }

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .update(updateFields)
    .eq('id', addressId)
    .select();

  if (error) throw new Error(error.message);
  return { found: true, data: data?.[0] ?? null };
}

export async function deleteAddressService(addressId: string, userId: string) {
  const { data: existing } = await supabaseAdmin
    .from('addresses')
    .select('user_id')
    .eq('id', addressId)
    .single();

  if (!existing || existing.user_id !== userId) return false;

  await supabaseAdmin.from('addresses').delete().eq('id', addressId);
  return true;
}
