"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Settings, Clock, Users, Video } from "lucide-react";
import Link from "next/link";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [meetings] = useState<{
    id: string;
    title: string;
    duration: number;
    meetingType: string;
    bookings: number;
    isActive: boolean;
  }[]>([]);

  if (!session) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ログインが必要です</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">オーナーダッシュボード</h1>
                <p className="text-gray-600">ミーティングタイプを管理し、予約を確認</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/participants">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>参加者ビューに切り替え</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user?.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">{session.user?.name?.charAt(0) || "U"}</span>
                  </div>
                )}
                <span className="text-sm text-gray-700">{session.user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブなミーティングタイプ</p>
                <p className="text-3xl font-bold text-gray-900">{meetings.filter(m => m.isActive).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今月の予約数</p>
                <p className="text-3xl font-bold text-gray-900">{meetings.reduce((sum, m) => sum + m.bookings, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均ミーティング時間</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(meetings.reduce((sum, m) => sum + m.duration, 0) / meetings.length)}分
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/owner/create">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-orange-500">
                <div className="text-center">
                  <Plus className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">新しいミーティングタイプを作成</h3>
                  <p className="text-sm text-gray-600">参加者が予約できる新しいミーティングタイプを設定</p>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">カレンダーを確認</h3>
                <p className="text-sm text-gray-600">今日の予定と今後のミーティングを確認</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-center">
                <Settings className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">設定</h3>
                <p className="text-sm text-gray-600">プロフィールとカレンダー連携の設定</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Types */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">ミーティングタイプ</h2>
            <Link href="/owner/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>新規作成</span>
              </Button>
            </Link>
          </div>

          {meetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        meeting.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {meeting.isActive ? "アクティブ" : "停止中"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{meeting.duration}分</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {meeting.meetingType === "google_meet" ? "Google Meet" : "Zoom"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{meeting.bookings}件の予約</span>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      編集
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        const url = `${window.location.origin}/book/${meeting.id}`;
                        navigator.clipboard.writeText(url);
                        alert("予約URLをクリップボードにコピーしました！");
                      }}
                      className="flex-1"
                    >
                      URLコピー
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ミーティングタイプがありません</h3>
              <p className="text-gray-600 mb-6">新しいミーティングタイプを作成して参加者が予約できるようにしましょう</p>
              <Link href="/owner/create">
                <Button>
                  最初のミーティングタイプを作成
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}