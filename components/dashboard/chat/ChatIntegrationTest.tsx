"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getChats,
  createChat,
  createHelpdeskChat,
  sendMessage,
  generateAIResponse,
} from "@/lib/chat-service";
import { tokenUtils } from "@/utils/auth";

export function ChatIntegrationTest() {
  const [testResults, setTestResults] = useState<
    Array<{
      test: string;
      status: "pending" | "success" | "error";
      message: string;
      data?: any;
    }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (
    test: string,
    status: "success" | "error" | "pending",
    message: string,
    data?: any,
  ) => {
    setTestResults((prev) => [...prev, { test, status, message, data }]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Wait a moment for authentication to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 500));

    const token = tokenUtils.getToken();
    const user = tokenUtils.getUser();

    if (!token) {
      addTestResult("Authentication", "error", "No authentication token found");
      setIsRunning(false);
      return;
    }

    if (!user) {
      addTestResult("Authentication", "error", "No user data found");
      setIsRunning(false);
      return;
    }

    addTestResult(
      "Authentication",
      "success",
      `Authenticated as ${user.name} (ID: ${user.id})`,
    );
    addTestResult(
      "Token Check",
      "success",
      `Token: ${token.substring(0, 20)}...`,
    );

    // Test 0: Backend Connectivity
    addTestResult(
      "Backend Connectivity",
      "pending",
      "Testing if Laravel backend is reachable...",
    );
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://kring.answer24.nl/api/v1";
      const response = await fetch(`${baseUrl}/chats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        addTestResult(
          "Backend Connectivity",
          "success",
          `Backend is reachable (Status: ${response.status})`,
        );
      } else {
        addTestResult(
          "Backend Connectivity",
          "error",
          `Backend returned status: ${response.status}`,
        );
      }
    } catch (error) {
      addTestResult(
        "Backend Connectivity",
        "error",
        `Cannot reach backend: ${error}`,
      );
    }

    // Test 0.5: Token Persistence Test
    addTestResult(
      "Token Persistence",
      "pending",
      "Testing if token persists across function calls...",
    );
    try {
      // Test token multiple times to see if it's consistent
      const token1 = tokenUtils.getToken();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const token2 = tokenUtils.getToken();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const token3 = tokenUtils.getToken();

      if (
        token1 &&
        token2 &&
        token3 &&
        token1 === token2 &&
        token2 === token3
      ) {
        addTestResult(
          "Token Persistence",
          "success",
          `Token is consistent across calls`,
        );
      } else {
        addTestResult(
          "Token Persistence",
          "error",
          `Token inconsistency detected: ${token1 ? "exists" : "null"} -> ${token2 ? "exists" : "null"} -> ${token3 ? "exists" : "null"}`,
        );
      }
    } catch (error) {
      addTestResult(
        "Token Persistence",
        "error",
        `Token persistence test failed: ${error}`,
      );
    }

    // Declare variables for the tests
    let helpdeskChat = null;

    try {
      // Test 1: Manual Token Test in Chat Actions
      addTestResult(
        "Manual Token Test",
        "pending",
        "Testing tokenUtils.getToken() directly...",
      );
      try {
        const directToken = tokenUtils.getToken();
        const directUser = tokenUtils.getUser();
        if (directToken && directUser) {
          addTestResult(
            "Manual Token Test",
            "success",
            `Direct token access works: ${directToken.substring(0, 20)}...`,
          );
        } else {
          addTestResult(
            "Manual Token Test",
            "error",
            `Direct token access failed: token=${!!directToken}, user=${!!directUser}`,
          );
        }
      } catch (error) {
        addTestResult(
          "Manual Token Test",
          "error",
          `Direct token access error: ${error}`,
        );
      }

      // Test 2: Get Chats
      addTestResult("Get Chats", "pending", "Testing chat list endpoint...");
      const chats = await getChats();
      addTestResult(
        "Get Chats",
        "success",
        `Found ${chats.length} chats`,
        chats,
      );

      // Test 3: Create Helpdesk Chat
      addTestResult(
        "Create Helpdesk Chat",
        "pending",
        "Creating helpdesk chat...",
      );

      // Double-check token right before calling createHelpdeskChat
      const tokenBeforeCreate = tokenUtils.getToken();
      if (!tokenBeforeCreate) {
        addTestResult(
          "Create Helpdesk Chat",
          "error",
          "Token became null before createHelpdeskChat call",
        );
      } else {
        console.log("=== BEFORE createHelpdeskChat ===");
        console.log(
          "Token before create:",
          tokenBeforeCreate.substring(0, 20) + "...",
        );
        console.log("User before create:", tokenUtils.getUser());
        console.log("==============================");

        try {
          helpdeskChat = await createHelpdeskChat();
          addTestResult(
            "Create Helpdesk Chat",
            "success",
            "Helpdesk chat created successfully",
            helpdeskChat,
          );
        } catch (error) {
          addTestResult(
            "Create Helpdesk Chat",
            "error",
            `createHelpdeskChat failed: ${error}`,
          );

          // Check token after the error
          const tokenAfterError = tokenUtils.getToken();
          console.log("=== AFTER createHelpdeskChat ERROR ===");
          console.log(
            "Token after error:",
            tokenAfterError ? tokenAfterError.substring(0, 20) + "..." : "NULL",
          );
          console.log("User after error:", tokenUtils.getUser());
          console.log("===================================");
        }
      }

      // Test 4: Send Message
      if (helpdeskChat) {
        addTestResult("Send Message", "pending", "Sending test message...");
        const message = await sendMessage(
          helpdeskChat.id,
          "Hello! This is a test message from the frontend integration.",
          tokenUtils.getUser()?.id || "1",
        );
        addTestResult(
          "Send Message",
          "success",
          "Message sent successfully",
          message,
        );

        // Test 5: AI Response (if enabled)
        if (helpdeskChat.aiEnabled) {
          addTestResult(
            "AI Response",
            "pending",
            "Testing AI response generation...",
          );
          try {
            const aiResponse = await generateAIResponse(
              helpdeskChat.id,
              "How can I help you?",
            );
            addTestResult(
              "AI Response",
              "success",
              "AI response generated successfully",
              aiResponse,
            );
          } catch (error) {
            addTestResult(
              "AI Response",
              "error",
              `AI response failed: ${error}`,
            );
          }
        } else {
          addTestResult("AI Response", "error", "AI is disabled for this chat");
        }
      }
    } catch (error) {
      addTestResult("Integration Test", "error", `Test failed: ${error}`);
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Chat System Integration Test
        </CardTitle>
        <p className="text-sm text-gray-600">
          Test the integration between frontend and Laravel backend
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={isRunning} className="flex-1">
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
          <Button variant="outline" onClick={clearResults} disabled={isRunning}>
            Clear Results
          </Button>
        </div>

        {/* Manual Token Test */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">
            Debug Token Test:
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const token = tokenUtils.getToken();
              const user = tokenUtils.getUser();
              console.log("=== DEBUG TOKEN INFO ===");
              console.log("Token:", token);
              console.log("User:", user);
              console.log(
                "API Base URL:",
                process.env.NEXT_PUBLIC_API_BASE_URL,
              );
              console.log("=========================");
              alert(
                `Token: ${token ? token.substring(0, 20) + "..." : "None"}\nUser: ${user ? user.name : "None"}`,
              );
            }}
            className="text-yellow-800 border-yellow-300"
          >
            Log Token Info to Console
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0">
                  {result.status === "pending" && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {result.status === "success" && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {result.status === "error" && (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✗</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.test}</span>
                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{result.message}</p>

                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">
                        View Response Data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connection Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Connection Information:</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">API Base URL:</span>
              <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_API_BASE_URL || "Not configured"}
              </span>
            </div>
            <div>
              <span className="font-medium">Authentication:</span>
              <span className="ml-2">
                {tokenUtils.getToken()
                  ? "✅ Authenticated"
                  : "❌ Not authenticated"}
              </span>
            </div>
            <div>
              <span className="font-medium">User ID:</span>
              <span className="ml-2">
                {tokenUtils.getUser()?.id || "Not available"}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Make sure you're logged in to the application</li>
            <li>2. Ensure your Laravel backend is running</li>
            <li>3. Verify the API base URL is correctly configured</li>
            <li>4. Run the tests to verify integration</li>
            <li>5. Check the results for any errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
