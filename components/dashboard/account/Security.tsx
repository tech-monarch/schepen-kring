"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { tokenUtils } from "@/utils/auth";
import { getApiUrl } from "@/lib/api-config";

type ApiResult<T = any> = { success: boolean; data?: T; message?: string };

function formatRelativeTime(dateLike?: string | number | Date | null) {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const s = Math.floor(diffMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  if (s < 60) return `${s} seconds ago`;
  if (m < 60) return `${m} minutes ago`;
  if (h < 24) return `${h} hours ago`;
  return `${day} days ago`;
}

async function fetchWithAuth(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  const token = tokenUtils.getToken();

  // ✅ Safely copy only string headers
  const extraHeaders =
    opts.headers && typeof opts.headers === "object" && !Array.isArray(opts.headers)
      ? (opts.headers as Record<string, string>)
      : {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(getApiUrl(path), { ...opts, headers });
}


/** --- Core API wrappers --- **/
async function updateLockSettingsAPI(data: {
  lock_key?: string;
  lock_timeout?: number;
}): Promise<ApiResult> {
  try {
    const res = await fetchWithAuth("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to update lock settings");
    return { success: true, data: json, message: json.message || "OK" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Network error" };
  }
}

async function updateUserPasswordAPI(data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<ApiResult> {
  try {
    const res = await fetchWithAuth("/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to change password");
    return { success: true, data: json, message: json.message || "OK" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Network error" };
  }
}

async function createPinAPI(data: { pin: string; confirm_pin: string }): Promise<ApiResult> {
  try {
    const res = await fetchWithAuth("/create-pin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to create PIN");

    // Try to extract pin in several shapes
    let pin: string | undefined;
    if (json?.data?.pin) pin = json.data.pin;
    else if (json?.pin) pin = json.pin;

    return { success: true, data: { ...json, pin }, message: json.message || "OK" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Network error" };
  }
}

async function changePinAPI(data: {
  current_pin: string;
  new_pin: string;
  confirm_pin: string;
}): Promise<ApiResult> {
  try {
    const res = await fetchWithAuth("/change-pin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to change PIN");
    return { success: true, data: json, message: json.message || "OK" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Network error" };
  }
}

async function toggle2FAAPI(enabled: boolean): Promise<ApiResult> {
  try {
    // endpoint in example used /v1/toggle-2fa — if your backend needs /toggle-2fa adjust accordingly
    const res = await fetchWithAuth("/v1/toggle-2fa", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to update 2FA");
    return { success: true, data: json, message: json.message || "OK" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Network error" };
  }
}

async function getActiveSessionsAPI(): Promise<ApiResult<any[]>> {
  try {
    // Matches the Route::get('/my-sessions', ...) in api.php
    const res = await fetchWithAuth("/my-sessions", { method: "GET" }); 
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to fetch active sessions");

    // The backend returns { status: 'success', data: [...] }
    const list = json?.data ?? []; 
    return { success: true, data: list, message: "OK" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Network error" };
  }
}

async function revokeSessionAPI(sessionId: string): Promise<ApiResult> {
  try {
    // Matches the Route::post('/logout-device', ...) in api.php
    const res = await fetchWithAuth("/logout-device", {
      method: "POST", // Changed from DELETE to POST to match controller
      body: JSON.stringify({ session_id: sessionId }), // Send as session_id body param
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to revoke session");
    return { success: true, data: json, message: json.message || "OK" };
  } catch (err: any) {
    return { success: false, message: err?.message ?? "Network error" };
  }
}

/** --- Component --- **/
export function Security() {
  const [isClient, setIsClient] = useState(false);

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  // Lock / PIN
  const [hasPin, setHasPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [lockKey, setLockKey] = useState("");
  const [confirmLockKey, setConfirmLockKey] = useState("");
  const [lockTimeout, setLockTimeout] = useState<number>(1);
  const [isUpdatingLock, setIsUpdatingLock] = useState(false);
  const [lockSettingsMsg, setLockSettingsMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Active sessions
  const [sessions, setSessions] = useState<any[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user meta (PIN / two-factor / timeout) and active sessions when client
  useEffect(() => {
    if (!isClient) return;

    try {
      const user = tokenUtils.getUser();
      if (user) {
        setHasPin(!!user.pin);
        setTwoFAEnabled(!!user.two_factor_enabled);
        setLockTimeout(user.lock_timeout ?? 1);
      }
    } catch (err) {
      console.error("Failed to read stored user:", err);
    }

    // fetch active sessions
    (async () => {
      const res = await getActiveSessionsAPI();
      if (res.success && res.data) {
        setSessions(res.data);
      } else {
        setSessions([]);
      }
    })();
  }, [isClient]);

  /** --- Handlers --- **/
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword.trim()) return setPasswordMsg({ type: "error", text: "Current password is required." });
    if (!newPassword.trim()) return setPasswordMsg({ type: "error", text: "New password is required." });
    if (newPassword.length < 8) return setPasswordMsg({ type: "error", text: "New password must be at least 8 characters long." });
    if (newPassword !== confirmPassword) return setPasswordMsg({ type: "error", text: "New passwords do not match." });
    if (currentPassword === newPassword) return setPasswordMsg({ type: "error", text: "New password must be different from current password." });

    setIsChangingPassword(true);
    try {
      const res = await updateUserPasswordAPI({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
      if (res.success) {
        setPasswordMsg({ type: "success", text: res.message ?? "Password updated" });
        toast.success(res.message ?? "Password updated");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: res.message ?? "Unable to update password" });
        toast.error(res.message ?? "Unable to update password");
      }
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err?.message ?? "Unexpected error" });
      toast.error(err?.message ?? "Unexpected error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = async (checked: boolean) => {
    setIsUpdating2FA(true);
    try {
      const res = await toggle2FAAPI(checked);
      if (!res.success) throw new Error(res.message || "Failed to update 2FA");
      setTwoFAEnabled(checked);

      // update stored user
      const currentUser = tokenUtils.getUser() || {};
      tokenUtils.setUser({ ...currentUser, two_factor_enabled: checked ? 1 : 0 });

      toast.success(checked ? "2FA enabled" : "2FA disabled");
    } catch (err: any) {
      console.error("2FA Toggle Error:", err);
      toast.error(err?.message ?? "Failed to update 2FA settings");
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const handleLockSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockSettingsMsg(null);

    if (!/^\d{6}$/.test(lockKey)) return setLockSettingsMsg({ type: "error", text: "PIN must be exactly 6 digits." });
    if (lockKey !== confirmLockKey) return setLockSettingsMsg({ type: "error", text: "PINs do not match." });
    if (lockTimeout < 1 || lockTimeout > 120) return setLockSettingsMsg({ type: "error", text: "Timeout must be between 1 and 120 minutes." });

    setIsUpdatingLock(true);
    try {
      let pinResult;
      if (hasPin) {
        if (!/^\d{6}$/.test(currentPin)) {
          setLockSettingsMsg({ type: "error", text: "Current PIN must be exactly 6 digits." });
          setIsUpdatingLock(false);
          return;
        }
        pinResult = await changePinAPI({ current_pin: currentPin, new_pin: lockKey, confirm_pin: confirmLockKey });
      } else {
        pinResult = await createPinAPI({ pin: lockKey, confirm_pin: confirmLockKey });
      }

      if (!pinResult.success) {
        setLockSettingsMsg({ type: "error", text: pinResult.message ?? "Failed to update PIN" });
        toast.error(pinResult.message ?? "Failed to update PIN");
        return;
      }

      const lockRes = await updateLockSettingsAPI({ lock_timeout: lockTimeout });
      if (!lockRes.success) {
        setLockSettingsMsg({ type: "error", text: lockRes.message ?? "Failed to save lock timeout" });
        toast.error(lockRes.message ?? "Failed to save lock timeout");
        return;
      }

      // persist lock settings locally (user object)
      const cur = tokenUtils.getUser() || {};
      const newUser = { ...cur, pin: pinResult.data?.pin ?? lockKey, lock_timeout: lockTimeout };
      tokenUtils.setUser(newUser);
      localStorage.setItem("lockTimeout", lockTimeout.toString());

      setLockSettingsMsg({ type: "success", text: "Lock screen settings saved successfully!" });
      toast.success("Lock screen settings saved successfully!");
      setLockKey(""); setConfirmLockKey(""); setCurrentPin("");
      if (!hasPin) setHasPin(true);
    } catch (err: any) {
      setLockSettingsMsg({ type: "error", text: err?.message ?? "Failed to save lock settings" });
      toast.error(err?.message ?? "Failed to save lock settings");
    } finally {
      setIsUpdatingLock(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!sessionId) return;
    setRevokingId(sessionId);
    try {
      const res = await revokeSessionAPI(sessionId);
      if (!res.success) throw new Error(res.message || "Failed to revoke session");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked");
    } catch (err: any) {
      console.error("Failed to revoke session:", err);
      toast.error(err?.message ?? "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  if (!isClient) {
    return (
      <div className="p-2">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading security settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
      <div className="space-y-8">
        {/* 2FA */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
          <p className="mt-1 text-sm text-gray-500">Add an extra layer of security to your account.</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Enable 2FA</p>
            <Switch checked={twoFAEnabled} disabled={isUpdating2FA} onCheckedChange={handleToggle2FA} />
          </div>
        </div>

        {/* Password Change */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isChangingPassword} />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isChangingPassword} />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isChangingPassword} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isChangingPassword}>{isChangingPassword ? "Updating..." : "Update Password"}</Button>
            </div>
            {passwordMsg && <div className={`mt-2 text-sm ${passwordMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>{passwordMsg.text}</div>}
          </form>
        </div>

        {/* Lock Screen Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Lock Screen</h3>
          <p className="mt-1 text-sm text-gray-500">{hasPin ? "Update your 6-digit PIN and inactivity timeout." : "Set a 6-digit PIN and inactivity timeout."}</p>
          <form className="mt-4 space-y-4" onSubmit={handleLockSettingsSubmit}>
            {hasPin && (
              <div>
                <Label htmlFor="current-pin">Current PIN</Label>
                <Input id="current-pin" type="password" inputMode="numeric" maxLength={6} placeholder="Enter current PIN" value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/[^0-9]/g, ""))} autoComplete="off" disabled={isUpdatingLock} />
              </div>
            )}
            <div>
              <Label htmlFor="lock-key">{hasPin ? "New 6-Digit PIN" : "6-Digit PIN"}</Label>
              <Input id="lock-key" type="password" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit key" value={lockKey} onChange={(e) => setLockKey(e.target.value.replace(/[^0-9]/g, ""))} autoComplete="off" disabled={isUpdatingLock} />
            </div>
            <div>
              <Label htmlFor="confirm-lock-key">{hasPin ? "Confirm New 6-Digit PIN" : "Confirm 6-Digit PIN"}</Label>
              <Input id="confirm-lock-key" type="password" inputMode="numeric" maxLength={6} placeholder="Confirm 6-digit key" value={confirmLockKey} onChange={(e) => setConfirmLockKey(e.target.value.replace(/[^0-9]/g, ""))} autoComplete="off" disabled={isUpdatingLock} />
            </div>
            <div>
              <Label htmlFor="lock-timeout">Lock Timeout (minutes)</Label>
              <Input id="lock-timeout" type="number" min={1} max={120} value={lockTimeout} onChange={(e) => setLockTimeout(Number(e.target.value))} disabled={isUpdatingLock} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingLock}>{isUpdatingLock ? "Saving..." : "Save Lock Settings"}</Button>
            </div>
            {lockSettingsMsg && <div className={`mt-2 text-sm ${lockSettingsMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>{lockSettingsMsg.text}</div>}
          </form>
        </div>

        {/* Active Sessions */}
<div className="mt-6 border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/50">
  <div className="p-6 border-b border-slate-100 bg-white">
    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Actieve Sessies</h3>
    <p className="text-xs text-slate-500 mt-1">Lijst met apparaten waar u momenteel bent ingelogd.</p>
  </div>

  <ul className="divide-y divide-slate-100">
    {sessions.length === 0 ? (
      <li className="p-8 text-center text-sm text-slate-400 font-medium">Geen actieve sessies gevonden.</li>
    ) : (
      sessions.map((session: any) => (
        <li key={session.id} className="flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            {/* Device Icon based on User Agent */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.is_current ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
              {session.user_agent?.toLowerCase().includes('mobile') ? '📱' : '💻'}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm">
                  {session.user_agent?.split('(')[0] || "Onbekend apparaat"}
                </p>
                {session.is_current && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Dit apparaat
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {session.ip_address} — {formatRelativeTime(session.last_active_at)}
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
            onClick={() => handleRevokeSession(session.id)} 
            disabled={revokingId === session.id}
          >
            {revokingId === session.id ? "Bezig..." : "Log uit"}
          </Button>
        </li>
      ))
    )}
  </ul>
</div>
      </div>
    </div>
  );
}

export default Security;
