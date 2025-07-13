"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Clock, Users, Video, Mail, MessageSquare, ArrowLeft, Shield, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OwnerBookings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  
  // ユーザー情報を取得
  const currentUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  
  // オーナーの予約一覧を取得
  const bookings = useQuery(
    api.bookings.getByOwner,
    currentUser ? { ownerId: currentUser._id } : "skip"
  ) || [];
  
  // ステータス更新用mutation
  const updateBookingStatus = useMutation(api.bookings.updateStatus);

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

  // ステータス更新処理
  const handleStatusUpdate = async (bookingId: string, newStatus: "scheduled" | "cancelled" | "completed", attendeeName: string) => {
    if (!currentUser) return;
    
    const statusMap = {
      scheduled: "予約中",
      cancelled: "キャンセル",
      completed: "完了"
    };
    
    const confirmMessage = `${attendeeName}さんの予約を「${statusMap[newStatus]}」に変更しますか？`;
    if (!confirm(confirmMessage)) return;
    
    setUpdatingBookingId(bookingId);
    try {
      await updateBookingStatus({
        bookingId: bookingId as any,
        status: newStatus,
        ownerId: currentUser._id as any,
      });
    } catch (error) {
      console.error("ステータス更新エラー:", error);
      const errorMessage = error instanceof Error ? error.message : "ステータスの更新に失敗しました";
      alert(errorMessage);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // フィルタリング
  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  // ステータス別件数を計算
  const statusCounts = {
    all: bookings.length,
    scheduled: bookings.filter(b => b.status === "scheduled").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

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
          <p className="text-gray-600">オーナー権限が必要です。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/owner" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
              <p className="text-gray-600">ミーティングの予約状況を確認・管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 統計とフィルター */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
                <p className="text-sm text-gray-600">総予約数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</p>
                <p className="text-sm text-gray-600">予約中</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
                <p className="text-sm text-gray-600">完了</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</p>
                <p className="text-sm text-gray-600">キャンセル</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                すべて
              </Button>
              <Button
                variant={filter === "scheduled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("scheduled")}
              >
                予約中
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                完了
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("cancelled")}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>

        {/* 予約一覧 */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              const scheduledDate = new Date(booking.scheduledTime);
              const isUpcoming = scheduledDate > new Date();
              const isPast = scheduledDate < new Date();
              
              return (
                <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.meeting.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {booking.status === "scheduled" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <RotateCcw className="h-3 w-3 mr-1" />
                              予約中
                            </span>
                          )}
                          {booking.status === "completed" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              完了
                            </span>
                          )}
                          {booking.status === "cancelled" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              キャンセル
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{booking.attendeeName}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{booking.attendeeEmail}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {scheduledDate.toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {scheduledDate.toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} ({booking.meeting.duration}分)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {booking.meeting.meetingType === "google_meet" ? "Google Meet" : "Zoom"}
                          </span>
                        </div>
                        
                        {booking.message && (
                          <div className="flex items-start space-x-2 md:col-span-2 lg:col-span-3">
                            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-gray-700 text-sm">{booking.message}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                      {booking.status === "scheduled" && (
                        <>
                          {isPast && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(booking._id, "completed", booking.attendeeName)}
                              disabled={updatingBookingId === booking._id}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              完了にする
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking._id, "cancelled", booking.attendeeName)}
                            disabled={updatingBookingId === booking._id}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            キャンセル
                          </Button>
                        </>
                      )}
                      
                      {booking.status === "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(booking._id, "scheduled", booking.attendeeName)}
                          disabled={updatingBookingId === booking._id}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          復活させる
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all" ? "予約がありません" : `${filter}の予約がありません`}
              </h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "まだ予約が入っていません。ミーティングタイプを共有して予約を受け付けましょう。"
                  : "該当する予約がありません。"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}