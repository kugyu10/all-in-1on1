"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Settings, LogOut, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">All in 1on1</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">{session.user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>サインアウト</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">総ミーティング数</h3>
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">アクティブなミーティングタイプ</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">予約数</h3>
              <User className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">総予約数</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">カレンダー</h3>
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-sm text-green-600 font-medium">✓ 接続済み</p>
            <p className="text-sm text-gray-600">Googleカレンダー</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">あなたのミーティングタイプ</h2>
            <Link href="/dashboard/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>ミーティングタイプを作成</span>
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ミーティングタイプがありません
            </h3>
            <p className="text-gray-600 mb-6">
              初めてのミーティングタイプを作成して予約受付を開始しましょう
            </p>
            <Link href="/dashboard/create">
              <Button size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>初めてのミーティングを作成</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}