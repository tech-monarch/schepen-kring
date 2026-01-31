"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, FormEvent, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { tokenUtils } from "@/utils/auth";
import { AuthGuard } from "@/components/AuthGuard";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    // Check if user is already authenticated
    if (tokenUtils.isAuthenticated()) {
      router.push("/dashboard");
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
      setIsVerifying(false);
      return;
    }

    // Verify the reset token
    verifyResetToken();
  }, [token, email, router]);

  async function verifyResetToken() {
    try {
      console.log("Verifying reset token with:", { email, token });
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-reset-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            token,
          }),
        },
      );

      console.log("Verify token response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Verify token success response:", data);
        setTokenValid(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Verify token failed:", response.status, errorData);
        setError(
          errorData.message ||
            "Invalid or expired reset link. Please request a new password reset.",
        );
      }
    } catch (err) {
      console.error("Error verifying reset token:", err);
      setError("Failed to verify reset link. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResetPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token,
            password,
            password_confirmation: confirmPassword,
          }),
        },
      );

      if (response.ok) {
        setIsSubmitted(true);
        // Start countdown and redirect
        const countdown = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              router.push("/login");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Failed to reset password. Please try again.",
        );
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative flex flex-col lg:flex-row w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden my-8">
          <div className="relative lg:w-1/2 h-64 lg:h-auto">
            <Image
              src="/image.png"
              alt="Verifying reset link"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Verifying Reset Link
              </h1>

              <p className="text-gray-600">
                Please wait while we verify your password reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state after password reset
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative flex flex-col lg:flex-row w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden my-8">
          <div className="relative lg:w-1/2 h-64 lg:h-auto">
            <Image
              src="/image.png"
              alt="Password reset successful"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Password Reset Successful
              </h1>

              <p className="text-gray-600 mb-4">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>

              <p className="text-sm text-gray-500 mb-8">
                Redirecting to sign in page in {redirectCountdown} seconds...
              </p>

              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state or invalid token
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative flex flex-col lg:flex-row w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden my-8">
          <div className="relative lg:w-1/2 h-64 lg:h-auto">
            <Image
              src="/image.png"
              alt="Invalid reset link"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Invalid Reset Link
              </h1>

              <p className="text-gray-600 mb-8">
                {error ||
                  "This password reset link is invalid or has expired. Please request a new one."}
              </p>

              <div className="space-y-4">
                <Link href="/forgot-password">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Request New Reset Link
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative flex flex-col lg:flex-row w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden my-8">
          <div className="relative lg:w-1/2 h-64 lg:h-auto">
            <Image
              src="/image.png"
              alt="Reset password"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <Link
                href="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Sign In
              </Link>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-600">
                Enter your new password below to complete the reset process.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleResetPasswordSubmit}>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-0 py-3 pr-10 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-0 py-3 pr-10 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {error && <div className="text-xs text-red-600">{error}</div>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
