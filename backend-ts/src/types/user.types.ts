export type UserRole = 'consumer' | 'farmer' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string | null;
  profile_image_url?: string | null;
  farm_name?: string | null;
  farm_location?: string | null;
  farm_description?: string | null;
  wallet_balance?: number | null;
  total_earnings?: number | null;
  created_at: string;
  updated_at: string;
  password_hash?: string;
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  farm_name?: string;
  farm_location?: string;
  farm_description?: string;
}

export interface GoogleAuthRequest {
  token: string;
  role: UserRole;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UserUpdateRequest {
  full_name?: string;
  phone_number?: string;
  farm_name?: string;
  farm_location?: string;
  farm_description?: string;
  profile_image_url?: string;
}

export interface AddressCreateRequest {
  label: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  is_default?: boolean;
}

export interface AddressUpdateRequest {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}
