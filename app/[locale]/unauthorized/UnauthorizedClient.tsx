"use client";

import React from "react";
import { Shield, AlertTriangle, Home, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      {/* Floating security icons */}
      <div className="absolute top-20 left-20 text-red-300 animate-bounce">
        <Lock className="h-8 w-8" />
      </div>
      <div className="absolute top-32 right-32 text-orange-300 animate-bounce delay-300">
        <Shield className="h-6 w-6" />
      </div>
      <div className="absolute bottom-20 left-32 text-yellow-400 animate-bounce delay-700">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="absolute bottom-32 right-20 text-red-400 animate-bounce delay-1000">
        <Lock className="h-5 w-5" />
      </div>

      <Card className="relative z-10 w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Main icon with glow effect */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Error code with style */}
          <div className="mb-4">
            <span className="inline-block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent text-6xl font-black tracking-wider">
              403
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-2 leading-relaxed">
            Oops! You don't have permission to access this area.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            This section requires administrator privileges.
          </p>

          {/* Warning box */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Restricted Access Zone
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional help text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Need admin access? Contact your system administrator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
