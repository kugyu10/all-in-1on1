"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Chrome } from "lucide-react";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/owner");
      }
    });
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl: "/owner",
        redirect: false,
      });
      
      if (result?.ok) {
        router.push("/owner");
      } else if (result?.error) {
        console.error("Sign in error:", result.error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Calendar className="h-12 w-12 text-orange-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            All in 1on1 にサインイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Googleカレンダーを連携してミーティングのスケジューリングを開始
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2"
              size="lg"
            >
              <Chrome className="h-5 w-5" />
              <span>
                {isLoading ? "サインイン中..." : "Googleでサインイン"}
              </span>
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                サインインすることで、Googleカレンダーを連携し、
                ミーティングのスケジューリングアクセスを許可することに同意します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}