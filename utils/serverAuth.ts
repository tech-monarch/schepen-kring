// utils/serverAuth.ts
import { cookies } from 'next/headers';

export const getAuthHeadersAsync = async (): Promise<HeadersInit> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const getTokenFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
};