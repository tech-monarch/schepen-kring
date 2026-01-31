import axios from "axios";
import { tokenUtils } from "@/utils/auth";

/*
  Email API service (replace example paths / payloads with real backend routes).

  Backend endpoints to implement (examples):

  1) List threads (pagination)
     GET  /v1/emails?folder=inbox&page=1&per_page=25
     Response: { success: true, data: [{ id, subject, snippet, updated_at, unread_count, participants, folder }] }

  2) Get thread details
     GET  /v1/emails/{threadId}
     Response: { success: true, data: { id, subject, messages: [{id, from, to, body, created_at, attachments}], updated_at } }

  3) Send new message / reply
     POST /v1/emails
     Payload: { thread_id?: string, to: string[], subject: string, body: string }
     Response: { success: true, data: { id, ... } }

  4) Delete thread or message
     DELETE /v1/emails/{id}
     Response: { success: true }

  5) Mark thread as read
     POST /v1/emails/{id}/mark-read
     Response: { success: true }

  6) Folders / labels
     GET /v1/email-folders
     Response: { success: true, data: [{ id, name, count }] }

  Notes for backend implementer:
  - Use standard JSON responses and place actual payload under `data`.
  - Protect endpoints with Bearer token auth.
  - Support pagination { page, per_page } on list endpoints.
*/

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.answer24.nlapi") // no trailing /v1 here if you prefer
    .replace(/\/$/, "") + "/v1";

function authHeaders() {
  const token = tokenUtils.getToken();
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    Accept: "application/json",
    "Content-Type": "application/json",
  } as Record<string, string | undefined>;
}

export type EmailThreadSummary = {
  id: string;
  subject?: string;
  snippet?: string;
  updated_at?: string;
  unread_count?: number;
  folder?: string;
  participants?: string[];
};

export type EmailMessage = {
  id: string;
  from: string;
  to: string[];
  body: string;
  created_at?: string;
  attachments?: any[];
};

export type EmailThread = {
  id: string;
  subject?: string;
  messages: EmailMessage[];
  updated_at?: string;
  folder?: string;
};

// GET /v1/emails?folder=&page=&per_page=
export async function fetchThreads(params?: {
  folder?: string;
  page?: number;
  per_page?: number;
}) {
  const url = `${API_BASE}/emails`;
  const res = await axios.get(url, { headers: authHeaders(), params });
  // normalize possible shapes: res.data.data || res.data
  return res.data?.data ?? res.data;
}

// GET /v1/emails/{threadId}
export async function fetchThread(threadId: string) {
  const url = `${API_BASE}/emails/${encodeURIComponent(threadId)}`;
  const res = await axios.get(url, { headers: authHeaders() });
  return res.data?.data ?? res.data;
}

// POST /v1/emails
// payload: { thread_id?, to: string[], subject: string, body: string }
export async function sendEmail(payload: {
  thread_id?: string;
  to: string[];
  subject: string;
  body: string;
}) {
  const url = `${API_BASE}/emails`;
  const res = await axios.post(url, payload, { headers: authHeaders() });
  return res.data;
}

// DELETE /v1/emails/{id}
export async function deleteThread(id: string) {
  const url = `${API_BASE}/emails/${encodeURIComponent(id)}`;
  const res = await axios.delete(url, { headers: authHeaders() });
  return res.data;
}

// POST /v1/emails/{id}/mark-read
export async function markThreadRead(id: string) {
  const url = `${API_BASE}/emails/${encodeURIComponent(id)}/mark-read`;
  const res = await axios.post(url, {}, { headers: authHeaders() });
  return res.data;
}

// GET /v1/email-folders
export async function fetchFolders() {
  const url = `${API_BASE}/email-folders`;
  const res = await axios.get(url, { headers: authHeaders() });
  return res.data?.data ?? res.data;
}
