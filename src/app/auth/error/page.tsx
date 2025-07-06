"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access denied. You may not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      default:
        return "An unexpected error occurred during authentication.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Please try signing in again, or contact support if the problem persists.
              </p>
              
              <div className="space-y-3">
                <Link href="/auth/signin">
                  <Button className="w-full">
                    Try Again
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}