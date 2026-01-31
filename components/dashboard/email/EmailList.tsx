"use client";

import React, { useEffect, useState } from "react";
import {
  fetchThreads,
  deleteThread,
  markThreadRead,
  EmailThreadSummary,
} from "./emailApi";

/*
  EmailList: no mock data. Calls fetchThreads() to load threads.
  Where to add backend calls:
   - fetchThreads() -> GET /v1/emails (already in emailApi.ts)
   - deleteThread(id) -> DELETE /v1/emails/{id}
   - markThreadRead(id) -> POST /v1/emails/{id}/mark-read
*/

export default function EmailList({
  onSelectThread,
}: {
  onSelectThread: (id: string) => void;
}) {
  const [threads, setThreads] = useState<EmailThreadSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [folder, setFolder] = useState("inbox");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Calls backend: GET /v1/emails?folder=inbox&page=1&per_page=25
        const data = await fetchThreads({ folder, page: 1, per_page: 25 });
        const list = Array.isArray(data) ? data : data?.items ?? [];
        if (mounted) setThreads(list);
      } catch (err) {
        console.error("Failed to load email threads", err);
        if (mounted) setThreads([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [folder]);

  const handleDelete = async (id: string) => {
    try {
      await deleteThread(id); // DELETE /v1/emails/{id}
      setThreads((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete thread", err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markThreadRead(id); // POST /v1/emails/{id}/mark-read
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, unread_count: 0 } : t))
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Emails</h3>
        <div>
          <select value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="inbox">Inbox</option>
            <option value="sent">Sent</option>
            <option value="archive">Archive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : threads.length === 0 ? (
        <div className="text-sm text-gray-500">No messages</div>
      ) : (
        <ul className="space-y-2 mt-4">
          {threads.map((t) => (
            <li
              key={t.id}
              className="p-2 border rounded hover:bg-gray-50 flex justify-between items-start"
            >
              <div
                className="cursor-pointer"
                onClick={() => onSelectThread(t.id)}
              >
                <div className="font-medium">{t.subject || "No subject"}</div>
                <div className="text-sm text-gray-500">{t.snippet || ""}</div>
                <div className="text-xs text-gray-400">{t.updated_at}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleMarkRead(t.id)}
                  className="text-sm text-blue-600"
                >
                  Mark read
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
