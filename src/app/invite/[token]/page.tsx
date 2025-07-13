"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { UserPlus, Shield, User, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = params.token as string;
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const tokenValidation = useQuery(
    api.invitations.validateToken,
    token ? { token } : "skip"
  );
  
  const currentUser = useQuery(
    api.users.getByEmail, 
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  
  const useInvitation = useMutation(api.invitations.useInvitation);

  useEffect(() => {
    // ログイン済みでトークンが有効な場合、自動的に権限を付与
    if (session && currentUser && tokenValidation?.valid && !isProcessing && !result) {
      handleUseInvitation();
    }
  }, [session, currentUser, tokenValidation, isProcessing, result]);

  const handleUseInvitation = async () => {
    if (!currentUser || !tokenValidation?.valid) return;

    setIsProcessing(true);
    try {
      const result = await useInvitation({
        token,
        userId: currentUser._id as any,
      });

      setResult({
        success: true,
        message: `${result.role === "owner" ? "オーナー" : "管理者"}権限が付与されました！`,
      });

      // 3秒後にリダイレクト
      setTimeout(() => {
        if (result.role === "owner") {
          router.push("/owner");
        } else {
          router.push("/admin");
        }
      }, 3000);
    } catch (error) {
      console.error("招待の使用に失敗:", error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "権限付与に失敗しました",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignIn = () => {
    signIn("google", { 
      callbackUrl: `/invite/${token}` 
    });
  };

  // ローディング状態
  if (status === "loading" || !tokenValidation) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">招待を確認中...</p>
        </div>
      </div>
    );
  }

  // トークンが無効な場合
  if (!tokenValidation.valid) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">招待が無効です</h1>
          <p className="text-gray-600 mb-6">{tokenValidation.error}</p>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  // 処理完了状態
  if (result) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {result.success ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">権限付与完了</h1>
              <p className="text-gray-600 mb-6">{result.message}</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>3秒後に自動的にリダイレクトします...</span>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
              <p className="text-gray-600 mb-6">{result.message}</p>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                ホームに戻る
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ログイン前の状態
  if (!session) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <UserPlus className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">招待を受け取りました</h1>
          
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {tokenValidation.invitation.role === "admin" ? (
                <Shield className="h-5 w-5 text-red-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              <span className="text-lg font-medium text-gray-900">
                {tokenValidation.invitation.role === "admin" ? "管理者" : "オーナー"}権限への招待
              </span>
            </div>
            
            {tokenValidation.invitation.email && (
              <p className="text-sm text-gray-600">
                対象: {tokenValidation.invitation.email}
              </p>
            )}
          </div>

          <p className="text-gray-600 mb-6">
            続行するには、Googleアカウントでログインしてください。
          </p>

          <Button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center space-x-2"
            size="lg"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Googleでログイン</span>
          </Button>
        </div>
      </div>
    );
  }

  // ログイン済みで処理中
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">権限を付与中...</h1>
          <p className="text-gray-600">しばらくお待ちください。</p>
        </div>
      </div>
    );
  }

  // メールアドレスが一致しない場合
  if (tokenValidation.invitation.email && 
      session?.user?.email !== tokenValidation.invitation.email) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">招待対象が異なります</h1>
          <p className="text-gray-600 mb-4">
            この招待は <strong>{tokenValidation.invitation.email}</strong> 用です。
          </p>
          <p className="text-gray-600 mb-6">
            現在ログイン中: <strong>{session.user?.email}</strong>
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => signIn("google", { callbackUrl: `/invite/${token}` })}
              className="w-full"
            >
              正しいアカウントでログイン
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              ホームに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}