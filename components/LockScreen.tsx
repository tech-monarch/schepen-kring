import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LockIcon } from "lucide-react";
import { tokenUtils } from "@/utils/auth";

interface LockScreenProps {
  onUnlock: () => void;
  show: boolean;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, show }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [userPin, setUserPin] = useState<string | null>(null);
  const [isSettingUpPin, setIsSettingUpPin] = useState(false);
  const [pinSetup, setPinSetup] = useState({
    pin: "",
    confirmPin: "",
  });
  const [pinSetupError, setPinSetupError] = useState("");
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<string | null>(null);

  // Debug: Log when userPin state changes
  useEffect(() => {
    console.log("LockScreen - userPin state changed to:", userPin);
  }, [userPin]);

  // Listen for user data updates
  useEffect(() => {
    const handleUserDataUpdate = (event: CustomEvent) => {
      const userData = event.detail;
      console.log("LockScreen - User data updated:", userData);
      if (userData && userData.pin) {
        setUserPin(userData.pin);
        setError("");
        console.log("LockScreen - PIN updated from event:", userData.pin);
      }
    };

    window.addEventListener(
      "userDataUpdated",
      handleUserDataUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "userDataUpdated",
        handleUserDataUpdate as EventListener,
      );
    };
  }, []);

  // Separate useEffect for client initialization
  useEffect(() => {
    console.log("LockScreen - Client initialization useEffect");
    setIsClient(true);
  }, []);

  // Separate useEffect for PIN detection when lock screen shows
  useEffect(() => {
    console.log(
      "LockScreen - PIN detection useEffect triggered with show:",
      show,
      "isClient:",
      isClient,
    );

    if (!show || !isClient) {
      if (!show) {
        console.log("LockScreen - Resetting state (lock screen hidden)");
        pinRef.current = null;
        setUserPin(null);
        setError("");
        setInput("");
      }
      return;
    }

    console.log("LockScreen - Starting PIN detection");

    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Get user's PIN from stored user data
    const getUserPin = () => {
      const userData = tokenUtils.getUser();
      console.log("=== LOCKSCREEN PIN DEBUG ===");
      console.log("LockScreen - User data:", userData);
      console.log("LockScreen - User PIN:", userData?.pin);
      console.log("LockScreen - User PIN type:", typeof userData?.pin);
      console.log("LockScreen - User PIN length:", userData?.pin?.length);
      console.log(
        "LockScreen - Full localStorage user_data:",
        localStorage.getItem("user_data"),
      );

      // Try to parse localStorage directly as backup
      let backupPin = null;
      try {
        const rawUserData = localStorage.getItem("user_data");
        if (rawUserData) {
          const parsedUserData = JSON.parse(rawUserData);
          console.log(
            "LockScreen - Parsed localStorage user data:",
            parsedUserData,
          );
          console.log("LockScreen - Parsed PIN:", parsedUserData?.pin);
          backupPin = parsedUserData?.pin;
        }
      } catch (e) {
        console.error("LockScreen - Error parsing localStorage user_data:", e);
      }

      console.log(
        "LockScreen - All localStorage keys:",
        Object.keys(localStorage),
      );

      // Debug: Check all localStorage values
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes("user") ||
          key.includes("auth") ||
          key.includes("token")
        ) {
          console.log(`LockScreen - ${key}:`, localStorage.getItem(key));
        }
      });
      console.log("==================================");

      // Use primary PIN or fallback to backup PIN
      const pin = userData?.pin || backupPin;

      console.log("LockScreen - Final PIN check:");
      console.log("LockScreen - userData?.pin:", userData?.pin);
      console.log("LockScreen - backupPin:", backupPin);
      console.log("LockScreen - final pin:", pin);
      console.log("LockScreen - pin type:", typeof pin);
      console.log("LockScreen - pin length:", pin?.length);

      if (pin && typeof pin === "string" && pin.length > 0) {
        console.log("LockScreen - Setting PIN and clearing error");
        pinRef.current = pin; // Store in ref for persistence
        setUserPin(pin);
        setError(""); // Clear any previous error
        console.log("LockScreen - PIN found and set:", pin);
      } else {
        // If no PIN is set, show error
        console.log("LockScreen - No valid PIN found, setting error");
        pinRef.current = null;
        setError("No PIN configured. Please set one in Security settings.");
        console.log("LockScreen - No PIN found");
      }
    };

    // Try immediately
    getUserPin();

    // Always retry after a short delay (in case localStorage is still loading)
    setTimeout(() => {
      getUserPin();
    }, 100);

    console.log("LockScreen - PIN detection setup complete");
  }, [show, isClient]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has a PIN configured
    const pinToUse = userPin || pinRef.current;
    if (!pinToUse) {
      setError("No PIN configured. Please set one in Security settings.");
      return;
    }

    console.log("Attempting unlock with PIN:", input);
    console.log("Expected PIN:", pinToUse);

    if (input === pinToUse) {
      setError("");
      setInput("");
      onUnlock();
    } else {
      setError("Incorrect PIN. Please try again.");
      setInput("");
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setInput(value);
    if (error && value.length === 6) {
      setError("");
    }
  };

  const handleSetupPin = () => {
    setIsSettingUpPin(true);
    setPinSetupError("");
  };

  const handlePinSetupChange = (field: "pin" | "confirmPin", value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    setPinSetup((prev) => ({ ...prev, [field]: numericValue }));
    if (pinSetupError) setPinSetupError("");
  };

  const createPin = async (data: { pin: string; confirm_pin: string }) => {
    try {
      const token = tokenUtils.getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1"}/create-pin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create PIN");
      }

      // Update user data with new PIN
      const currentUser = tokenUtils.getUser();
      const updatedUser = {
        ...currentUser,
        pin: data.pin, // Use the PIN from request since API might not return it
      };
      tokenUtils.setUser(updatedUser);

      return { success: true, message: "PIN created successfully!" };
    } catch (error) {
      console.error("Error creating PIN:", error);
      throw error;
    }
  };

  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pinSetup.pin.length !== 6) {
      setPinSetupError("PIN must be 6 digits");
      return;
    }

    if (pinSetup.confirmPin.length !== 6) {
      setPinSetupError("Please confirm your PIN");
      return;
    }

    if (pinSetup.pin !== pinSetup.confirmPin) {
      setPinSetupError("PINs do not match");
      return;
    }

    setIsCreatingPin(true);
    setPinSetupError("");

    try {
      await createPin({
        pin: pinSetup.pin,
        confirm_pin: pinSetup.confirmPin,
      });

      // Success - update local state and unlock
      setUserPin(pinSetup.pin);
      setIsSettingUpPin(false);
      setPinSetup({ pin: "", confirmPin: "" });

      // Automatically unlock after PIN creation
      onUnlock();
    } catch (err: any) {
      setPinSetupError(
        err.message || "Failed to create PIN. Please try again.",
      );
    } finally {
      setIsCreatingPin(false);
    }
  };

  const handleBackToUnlock = () => {
    setIsSettingUpPin(false);
    setPinSetup({ pin: "", confirmPin: "" });
    setPinSetupError("");
  };

  if (!show || !isClient) return null;

  // Use ref value as fallback if state is null but ref has value
  const currentPin = userPin || pinRef.current;
  console.log(
    "LockScreen - Rendering with userPin:",
    userPin,
    "pinRef.current:",
    pinRef.current,
    "currentPin:",
    currentPin,
    "show:",
    show,
    "isClient:",
    isClient,
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/95 backdrop-blur-sm"
        >
          {isSettingUpPin ? (
            // PIN Setup Form
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleCreatePin}
              className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center w-full max-w-sm mx-4"
            >
              <LockIcon className="w-12 h-12 text-blue-900 mb-4" />

              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Set Up PIN
              </h2>
              <p className="mb-6 text-gray-500 text-sm text-center">
                Create a 6-digit PIN to secure your application.
              </p>

              <div className="space-y-4 w-full">
                <div>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={pinSetup.pin}
                    onChange={(e) =>
                      handlePinSetupChange("pin", e.target.value)
                    }
                    className="w-full text-center text-lg tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    placeholder="Enter 6-digit PIN"
                    aria-label="6-digit PIN"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Choose a secure 6-digit PIN
                  </p>
                </div>

                <div>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={pinSetup.confirmPin}
                    onChange={(e) =>
                      handlePinSetupChange("confirmPin", e.target.value)
                    }
                    className="w-full text-center text-lg tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    placeholder="Confirm 6-digit PIN"
                    aria-label="Confirm 6-digit PIN"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Re-enter your PIN to confirm
                  </p>
                </div>
              </div>

              {pinSetupError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mb-4 text-center mt-4"
                >
                  {pinSetupError}
                </motion.div>
              )}

              <div className="flex space-x-3 mt-6 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToUnlock}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isCreatingPin}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                  disabled={
                    pinSetup.pin.length !== 6 ||
                    pinSetup.confirmPin.length !== 6 ||
                    isCreatingPin
                  }
                >
                  {isCreatingPin ? "Creating PIN..." : "Create PIN"}
                </Button>
              </div>
            </motion.form>
          ) : (
            // Unlock Form
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleUnlock}
              className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center w-full max-w-sm mx-4"
            >
              <LockIcon className="w-12 h-12 text-blue-900 mb-4" />

              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Secure Access
              </h2>
              <p className="mb-6 text-gray-500 text-sm text-center">
                {currentPin
                  ? "Enter your 6-digit PIN to unlock the application."
                  : "Set up a PIN to secure your application."}
              </p>

              {currentPin && (
                <Input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  minLength={6}
                  value={input}
                  onChange={handleInputChange}
                  className="mb-4 text-center text-lg tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="••••••"
                  aria-label="6-digit PIN"
                />
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mb-4 text-center"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type={currentPin ? "submit" : "button"}
                onClick={!currentPin ? handleSetupPin : undefined}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                disabled={currentPin ? input.length !== 6 : false}
              >
                {!currentPin ? "Set Up PIN" : "Unlock"}
              </Button>

              {!currentPin && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Click "Set Up PIN" to create a secure PIN for your
                  application.
                </p>
              )}
            </motion.form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LockScreen;
