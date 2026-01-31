"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, FormEvent, useEffect } from "react";
import { useTranslations } from "next-intl";
import { authAPI, tokenUtils } from "@/utils/auth";
import { useRouter } from "@/i18n/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { User, Store } from "lucide-react"; //  Added for Toggle Icons

interface Errors {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: string;
  formatted_price: string;
  duration_days: number;
  features: any[];
  color: string;
  created_at: string;
  updated_at: string;
}

export default function PartnerSignUp() {
  const [signUpStep, setSignUpStep] = useState(1);
  const [role, setRole] = useState<0 | 2>(0); // Added Role State
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
  });
  const t = useTranslations("SignInPage");
  const router = useRouter();
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");

  // Fetch subscription plans when component mounts or when step 2 is reached
  useEffect(() => {
    if (signUpStep === 2) {
      fetchSubscriptionPlans();
    }
  }, [signUpStep]);

  async function fetchSubscriptionPlans() {
    setLoadingPlans(true);
    try {
      const token = tokenUtils.getToken();
      if (!token) {
        console.error("No token found in localStorage");
        setError("Authentication required. Please try signing up again.");
        setLoadingPlans(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Partner plan API response:", result);
        setSubscriptionPlans(result.data || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to fetch partner plans:",
          response.status,
          errorData,
        );
        setError(
          `Failed to load subscription plans (${response.status}). Please try again.`,
        );
      }
    } catch (err) {
      console.error("Error fetching partner subscription plans:", err);
      setError("Failed to load subscription plans. Please try again.");
    } finally {
      setLoadingPlans(false);
    }
  }

  function validateAccountDetails(): boolean {
    let valid = true;
    const newErrors: Errors = {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: "",
    };
    if (!fullName.trim()) {
      newErrors.fullName = t("errors.fullNameRequired");
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = t("errors.emailRequired");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("errors.invalidEmail");
      valid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = t("errors.phoneRequired");
      valid = false;
    }
    if (!password) {
      newErrors.password = t("errors.passwordRequired");
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = t("errors.passwordTooShort");
      valid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmPasswordRequired");
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("errors.passwordsDontMatch");
      valid = false;
    }
    if (!agreeTerms) {
      newErrors.agreeTerms = t("errors.agreeTermsRequired");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }



async function handlePartnerSignUpSubmit(
  e: FormEvent<HTMLFormElement>,
): Promise<void> {
  e.preventDefault();
  if (!validateAccountDetails()) return;

  setError("");
  setIsLoading(true);
  
  // --- NEW: GRAB THE SAVED REFERRAL CODE ---
  const savedCode = sessionStorage.getItem("pending_referral_code");
  // -----------------------------------------

  try {
    const response = await authAPI.register({
      name: fullName,
      email,
      phone,
      gender,
      city,
      password,
      password_confirmation: confirmPassword,
      role: role,
      referral_code: savedCode, // <-- ADD THIS LINE HERE
    });

    // If registration was successful
    setSuccess(true);
    setError("");

    // --- NEW: CLEAR THE CODE AFTER SUCCESS ---
    sessionStorage.removeItem("pending_referral_code");
    // ------------------------------------------

    setTimeout(() => {
      if (response.is_approved === 0 || role === 2) {
        tokenUtils.removeToken(); 
        setIsPendingApproval(true); 
        const encodedEmail = encodeURIComponent(email);
        router.push(`/signup/pending?identifier=${encodedEmail}`); 
      } else {
        router.push("/webshop");
      }
    }, 2000);

  } catch (err: any) {
    setError(err?.message || "Registration failed. Please try again.");
    setSuccess(false);
  } finally {
    setIsLoading(false);
  }
}

  function handlePlanSelection(planId: string): void {
    setSelectedPlanId(planId);
    setShowPaymentMethods(true);
    setError("");
  }

  async function handleSubscription(paymentMethod: string): Promise<void> {
    if (!selectedPlanId) return;

    setError("");
    setSelectedPaymentMethod(paymentMethod);
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: selectedPlanId,
            payment_method: paymentMethod,
          }),
        },
      );
      if (response.ok) {
        const result = await response.json();
        console.log("Partner subscription successful:", result);
        // Check if we got a checkout URL for payment
        if (result.data?.checkout_url) {
          console.log(
            "Redirecting partner to checkout:",
            result.data.checkout_url,
          );
          // Redirect to payment checkout
          window.location.href = result.data.checkout_url;
        } else {
          // If no checkout URL, redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        const errorData = await response.json();
        console.error("Partner subscription failed:", errorData);
        setError(
          errorData.message || "Failed to subscribe to plan. Please try again.",
        );
      }
    } catch (err: any) {
      console.error("Error subscribing partner to plan:", err);
      setError(err.message || "Plan selection failed. Please try again.");
    } finally {
      setSelectedPaymentMethod(null);
    }
  }

  const handleGoogleSignIn = () => {
    console.log("Partner signing up with Google...");
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div
          className={`relative flex flex-col lg:flex-row ${
            signUpStep === 1
              ? "w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2"
              : "w-full max-w-7xl"
          } bg-white rounded-2xl shadow-lg overflow-hidden my-8`}
        >
          {signUpStep === 1 && (
            <div className="relative lg:w-1/2 h-64 lg:h-auto">
              <Image
                src="/image.png"
                alt="Partner signup"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}

          <div
            className={`${
              signUpStep === 1 ? "lg:w-1/2" : "w-full"
            } p-8 lg:p-12 flex flex-col justify-center`}
          >
            {signUpStep === 2 ? (
              <>
                <div className="mb-2 text-gray-700 font-medium">
                  {t("signUp.selectPlan")}
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  Partner {t("signUp.subscriptionPlans")}
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                    {error}
                  </div>
                )}

                {loadingPlans ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading partner subscription plans...
                    </span>
                  </div>
                ) : showPaymentMethods && selectedPlanId ? (
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-bold mb-4 text-center">
                      Choose Payment Method
                    </h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => handleSubscription("wallet")}
                        disabled={selectedPaymentMethod === "wallet"}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 disabled:opacity-50"
                      >
                        {selectedPaymentMethod === "wallet"
                          ? "Processing..."
                          : "Pay with Wallet"}
                      </Button>
                      <Button
                        onClick={() => handleSubscription("mollie")}
                        disabled={selectedPaymentMethod === "mollie"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 disabled:opacity-50"
                      >
                        {selectedPaymentMethod === "mollie"
                          ? "Processing..."
                          : "Pay with Mollie"}
                      </Button>
                    </div>
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPaymentMethods(false);
                          setSelectedPlanId(null);
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ← Back to Plans
                      </Button>
                    </div>
                  </div>
                ) : subscriptionPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`bg-white rounded-xl shadow p-6 border ${
                          selectedPlanId === plan.id
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                        style={{ borderColor: plan.color }}
                      >
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-xl font-bold">
                            {plan.display_name || plan.name}
                          </span>
                          <span className="text-blue-600 font-bold text-lg">
                            {plan.formatted_price}
                          </span>
                        </div>
                        {plan.duration_days && (
                          <div className="text-xs text-gray-500 mb-2">
                            {plan.duration_days} days duration
                          </div>
                        )}
                        <div className="mb-4 text-gray-700 text-sm">
                          {plan.description}
                        </div>
                        <Button
                          onClick={() => handlePlanSelection(plan.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mb-4 cursor-pointer"
                          style={{ backgroundColor: plan.color }}
                        >
                          Select Plan
                        </Button>
                        {plan.features && plan.features.length > 0 && (
                          <div>
                            <div className="font-semibold mb-1">
                              Features included:
                            </div>
                            <ul className="text-xs text-gray-700 list-disc pl-5">
                              {plan.features.map(
                                (feature: any, index: number) => (
                                  <li key={index}>
                                    {typeof feature === "string"
                                      ? feature
                                      : JSON.stringify(feature)}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      No partner subscription plans available at the moment.
                    </p>
                    <Button
                      onClick={fetchSubscriptionPlans}
                      variant="outline"
                      className="mt-4"
                    >
                      Retry Loading Plans
                    </Button>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setSignUpStep(1)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← Back to Account Details
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  {/* Dynamic Title based on Role  */}
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {role === 2
                      ? t("signUp.partnerSignUpTitle")
                      : "Create User Account"}
                  </h1>
                  <p className="text-blue-600 text-lg">
                    Join as a {role === 2 ? "Partner" : "User"}
                  </p>
                </div>

                {/* --- INSERTED: Role Toggle Switch [cite: 251] --- */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-6 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setRole(0)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                      role === 0
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <User className="h-4 w-4" /> Shopper
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(2)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                      role === 2
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Store className="h-4 w-4" /> Merchant
                  </button>
                </div>
                {/* ------------------------------------------- */}

                <form
                  className="space-y-6"
                  onSubmit={handlePartnerSignUpSubmit}
                >
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center space-x-2 border border-gray-300 rounded-lg py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Image
                      src="/google-icon.svg"
                      alt="Google"
                      width={20}
                      height={20}
                    />
                    <span>{t("signInWithGoogle")}</span>
                  </button>

                  <div className="relative flex items-center justify-center my-6">
                    <span className="absolute bg-white px-2 text-sm text-gray-500">
                      {t("or")}
                    </span>
                    <div className="w-full border-t border-gray-300"></div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                      {isPendingApproval ? (
                        <div>
                          <p className="font-bold">Registration Received!</p>
                          <p>Your merchant account is pending admin approval. You will receive an email once your account is activated.</p>
                        </div>
                      ) : (
                        "Registration successful! Redirecting..."
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder={t("signUp.fullName")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                    />
                    {errors.fullName && (
                      <div className="text-xs text-red-600">
                        {errors.fullName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder={t("email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                    />
                    {errors.email && (
                      <div className="text-xs text-red-600">{errors.email}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="Telefoonnummer"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                    />
                    {errors.phone && (
                      <div className="text-xs text-red-600">{errors.phone}</div>
                    )}
                  </div>


<div className="space-y-2">
  <label className="text-sm font-bold text-slate-700 ml-1">Geslacht</label>
  <select 
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50/50 text-sm"
  >
    <option value="">Selecteer geslacht</option>
    <option value="male">Man</option>
    <option value="female">Vrouw</option>
    <option value="other">Anders</option>
  </select>
</div>

{/* City Input */}
<div className="space-y-2">
  <label className="text-sm font-bold text-slate-700 ml-1">Stad</label>
  <input 
    type="text"
    value={city}
    onChange={(e) => setCity(e.target.value)}
    placeholder="Bijv. Amsterdam"
    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50/50 text-sm"
  />
</div>

                  <div className="space-y-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder={t("password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                    />
                    {errors.password && (
                      <div className="text-xs text-red-600">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder={t("signUp.passwordAgain")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                    />
                    {errors.confirmPassword && (
                      <div className="text-xs text-red-600">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start space-x-3 mt-6">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="agreeTerms"
                      className="text-sm text-gray-600"
                    >
                      {t("termsText")}{" "}
                      <Link href="#" className="text-blue-600 hover:underline">
                        {t("termsOfService")}
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-blue-600 hover:underline">
                        {t("privacyPolicy")}
                      </Link>
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <div className="text-xs text-red-600">
                      {errors.agreeTerms}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? "Creating Account..."
                      : success
                        ? "Registration Successful!"
                        : `Sign Up as ${role === 2 ? "Partner" : "User"}`}
                  </Button>

                  <div className="text-center text-sm text-gray-600 mt-6">
                    {t("alreadyCustomer")}{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:underline"
                    >
                      {t("login")}
                    </Link>{" "}
                    {/* or{" "}
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:underline"
                  >
                    Regular Sign Up
                  </Link> */}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
