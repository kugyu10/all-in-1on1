"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, Video, Shield, Trash2, Edit, Clock } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 予約数表示コンポーネント
function BookingCount({ meetingId }: { meetingId: string }) {
  const bookingCount = useQuery(
    api.meetings.getMeetingBookingCount,
    { meetingId: meetingId as any }
  );

  return (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600">
        {bookingCount !== undefined ? `${bookingCount}件の予約` : "読み込み中..."}
      </span>
    </div>
  );
}

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  
  // ユーザー情報を取得
  const currentUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  
  // ユーザーのミーティングを取得
  const meetings = useQuery(
    api.meetings.getByOwner,
    currentUser ? { ownerId: currentUser._id } : "skip"
  ) || [];

  // ミーティング削除用mutation
  const deleteOwnerMeeting = useMutation(api.meetings.deleteOwnerMeeting);

  // ミーティング削除処理
  const handleDeleteMeeting = async (meetingId: string, meetingTitle: string) => {
    if (!currentUser) return;
    
    const confirmMessage = `「${meetingTitle}」を削除しますか？\n\nこの操作は取り消せません。予約がある場合は削除できません。`;
    if (!confirm(confirmMessage)) return;
    
    setDeletingMeetingId(meetingId);
    try {
      await deleteOwnerMeeting({
        meetingId: meetingId as any,
        ownerId: currentUser._id as any,
      });
      alert("ミーティングタイプを削除しました");
    } catch (error) {
      console.error("ミーティング削除エラー:", error);
      const errorMessage = error instanceof Error ? error.message : "ミーティングの削除に失敗しました";
      alert(errorMessage);
    } finally {
      setDeletingMeetingId(null);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    
    if (currentUser && !currentUser.isOwner) {
      router.push("/");
      return;
    }
  }, [session, status, currentUser, router]);

  if (status === "loading" || !currentUser) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser.isOwner) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス拒否</h1>
          <p className="text-gray-600 mb-6">オーナー権限が必要です。</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              オーナーになるには、管理者からの招待が必要です。
            </p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
            >
              ホームに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">オーナーダッシュボード</h1>
              <p className="text-gray-600">ミーティングタイプを管理し、予約を確認</p>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブなミーティングタイプ</p>
<p className="text-3xl font-bold text-gray-900">{meetings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今月の予約数</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/owner/create">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-orange-500">
                <div className="text-center">
                  <Plus className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">新しいミーティングタイプを作成</h3>
                  <p className="text-sm text-gray-600">参加者が予約できる新しいミーティングタイプを設定</p>
                </div>
              </div>
            </Link>

            <Link href="/owner/bookings">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">予約管理</h3>
                  <p className="text-sm text-gray-600">予約中・実施済みを含むミーティングの一覧</p>
                </div>
              </div>
            </Link>
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
                <div key={meeting._id} className="bg-white rounded-lg shadow-lg p-6">
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

                    <BookingCount meetingId={meeting._id} />
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        編集
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          const url = `${window.location.origin}/book/${meeting._id}`;
                          navigator.clipboard.writeText(url);
                          alert("予約URLをクリップボードにコピーしました！");
                        }}
                        className="flex-1"
                      >
                        URLコピー
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteMeeting(meeting._id, meeting.title)}
                      disabled={deletingMeetingId === meeting._id}
                      className="w-full flex items-center justify-center space-x-1"
                    >
                      {deletingMeetingId === meeting._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>削除中...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>削除</span>
                        </>
                      )}
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