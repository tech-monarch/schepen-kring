"use client";

import React, { useEffect, useState } from "react";
import { fetchThread, sendEmail, EmailThread, EmailMessage } from "./emailApi";

/*
  EmailDetails: no mock data. Calls fetchThread(threadId) to load messages,
  and sendEmail(payload) to send replies or new messages.

  Backend endpoints used:
   - GET  /v1/emails/{threadId}   -> fetchThread(threadId)
   - POST /v1/emails               -> sendEmail({ thread_id, to, subject, body })
*/

export default function EmailDetails({
  threadId,
  onSent,
}: {
  threadId?: string | null;
  onSent?: () => void;
}) {
  const [thread, setThread] = useState<EmailThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replySubject, setReplySubject] = useState("");

  useEffect(() => {
    if (!threadId) {
      setThread(null);
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // GET /v1/emails/{threadId}
        const data = await fetchThread(threadId);
        if (mounted) {
          setThread(data);
          setReplySubject(data?.subject ? `Re: ${data.subject}` : "");
        }
      } catch (err) {
        console.error("Failed to load thread", err);
        if (mounted) setThread(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [threadId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadId && !replySubject) return;
    setSending(true);
    try {
      // POST /v1/emails { thread_id?, to: [], subject, body }
      await sendEmail({
        thread_id: threadId ?? undefined,
        to: [],
        subject: replySubject,
        body: replyBody,
      });
      setReplyBody("");
      onSent && onSent();
      // optionally re-fetch thread or append sent message to UI
      if (threadId) {
        const updated = await fetchThread(threadId);
        setThread(updated);
      }
    } catch (err) {
      console.error("Send failed", err);
    } finally {
      setSending(false);
    }
  };

  if (!threadId) {
    return (
      <div className="text-sm text-gray-500">Select a message to view</div>
    );
  }

  if (loading) return <div>Loading thread...</div>;
  if (!thread)
    return <div className="text-sm text-gray-500">Message not found</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{thread.subject}</h3>

      <div className="space-y-2">
        {thread.messages.map((m: EmailMessage) => (
          <div key={m.id} className="p-3 border rounded">
            <div className="text-xs text-gray-500">
              {m.from} — {m.created_at}
            </div>
            <div className="mt-2 whitespace-pre-wrap">{m.body}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="space-y-2">
        <input
          className="w-full p-2 border rounded"
          value={replySubject}
          onChange={(e) => setReplySubject(e.target.value)}
          placeholder="Subject"
        />
        <textarea
          className="w-full p-2 border rounded"
          rows={6}
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button type="submit" className="btn" disabled={sending}>
            {sending ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
