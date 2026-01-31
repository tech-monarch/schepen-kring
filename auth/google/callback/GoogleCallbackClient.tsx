"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tokenUtils } from "@/utils/auth";

export default function GoogleCallbackClient() {
  const [status, setStatus] = useState("Processing...");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    handleGoogleCallback();
  }, []);

  async function handleGoogleCallback() {
    try {
      // Get the authorization code from URL parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      // Handle OAuth errors
      if (error) {
        setError(`OAuth error: ${error}`);
        setStatus("Authentication failed");
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setStatus("Authentication failed");
        return;
      }

      setStatus("Exchanging code for token...");

      // Exchange the authorization code for an access token
      const tokenResponse = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          state: state,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(
          errorData.message || "Failed to exchange code for token",
        );
      }

      const tokenData = await tokenResponse.json();

      setStatus("Storing authentication data...");

      console.log("=== GOOGLE CALLBACK DEBUG ===");
      console.log("Full tokenData:", tokenData);
      console.log("TokenData token:", tokenData.token);
      console.log("TokenData data token:", tokenData.data?.token);
      console.log("===============================");

      // Handle token from different possible locations
      let tokenToStore = null;
      if (tokenData.token) {
        tokenToStore = tokenData.token;
      } else if (tokenData.data && tokenData.data.token) {
        tokenToStore = tokenData.data.token;
      }

      if (tokenToStore) {
        console.log("Storing Google token:", tokenToStore);
        tokenUtils.setToken(tokenToStore);
      } else {
        console.error("No token found in Google callback response:", tokenData);
      }

      // Handle user data and PIN
      let userData = null;
      if (tokenData.user) {
        userData = tokenData.user;
      } else if (tokenData.data && tokenData.data.user) {
        userData = tokenData.data.user;
      }

      // Add PIN to user data if available
      if (tokenData.data && tokenData.data.pin) {
        userData = {
          ...userData,
          pin: tokenData.data.pin,
        };
      }

      console.log("Final Google user data to store:", userData);

      if (userData) {
        tokenUtils.setUser(userData);
      }

      setStatus("Authentication successful! Redirecting...");

      // Redirect to dashboard or intended destination
      const redirectTo = state ? decodeURIComponent(state) : "/dashboard";

      // Use setTimeout to ensure state updates are visible before redirect
      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);
    } catch (err) {
      console.error("Google callback error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setStatus("Authentication failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Google Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">{status}</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {!error && status === "Authentication successful! Redirecting..." && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Welcome! You will be redirected shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
