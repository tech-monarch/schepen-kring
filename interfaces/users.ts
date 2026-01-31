import type { BaseResponse } from "./base";

export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  lock_screen_time: number | null;
  gauth_id: string | null;
  meta_id: string | null;
  meta_platform: string | null;
  auth_strategy: string;
  role_id: string;
  profile_picture: string | null;
  profile_picture_id: string | null;
  created_at: string;
  updated_at: string;
  role: Role;
}
