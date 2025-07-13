"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Shield, User, Clock, Video, ArrowLeft, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MeetingsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  
  const currentUser = useQuery(
    api.users.getByEmail, 
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  
  const allMeetings = useQuery(api.meetings.getAllMeetings);
  const allUsers = useQuery(api.users.getAllUsers);
  const updateMeeting = useMutation(api.meetings.updateMeeting);
  const deleteMeeting = useMutation(api.meetings.deleteMeeting);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    
    if (currentUser && !currentUser.isAdmin) {
      router.push("/");
      return;
    }
  }, [session, status, currentUser, router]);

  const handleStatusToggle = async (meetingId: string, currentStatus: boolean) => {
    try {
      await updateMeeting({
        meetingId: meetingId as any,
        isActive: !currentStatus,
      });
    } catch (error) {
      console.error("ミーティング状態の更新に失敗:", error);
      alert("ミーティング状態の更新に失敗しました");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("このミーティングタイプを削除しますか？この操作は取り消せません。")) {
      return;
    }

    try {
      await deleteMeeting({
        meetingId: meetingId as any,
      });
    } catch (error) {
      console.error("ミーティングの削除に失敗:", error);
      alert("ミーティングの削除に失敗しました");
    }
  };

  const getOwnerName = (ownerId: string) => {
    const owner = allUsers?.find(user => user._id === ownerId);
    return owner ? owner.name : "不明";
  };

  if (status === "loading" || !currentUser) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス拒否</h1>
          <p className="text-gray-600">管理者権限が必要です。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ミーティング管理</h1>
              <p className="text-gray-600">全ユーザーのミーティングタイプを管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ミーティング一覧 */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">ミーティングタイプ一覧</h2>
            <p className="text-sm text-gray-600 mt-1">
              総ミーティング数: {allMeetings?.length || 0}件
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ミーティング情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    オーナー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    設定
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allMeetings?.map((meeting) => (
                  <tr key={meeting._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {meeting.title}
                        </div>
                        {meeting.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {meeting.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {getOwnerName(meeting.ownerId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {meeting.duration}分
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Video className="h-4 w-4 mr-1" />
                          {meeting.meetingType === "google_meet" ? "Google Meet" : "Zoom"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(meeting._id, meeting.isActive)}
                        className="flex items-center space-x-2"
                      >
                        {meeting.isActive ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">有効</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-400 font-medium">無効</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(meeting.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingMeeting(meeting._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="詳細表示"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting._id)}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allMeetings?.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ミーティングが見つかりません</h3>
              <p className="text-gray-600">まだミーティングタイプが作成されていません。</p>
            </div>
          )}
        </div>

        {/* ミーティング詳細モーダル */}
        {editingMeeting && allMeetings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                {(() => {
                  const meeting = allMeetings.find(m => m._id === editingMeeting);
                  if (!meeting) return null;
                  
                  return (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">ミーティング詳細</h3>
                        <button
                          onClick={() => setEditingMeeting(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                          <p className="text-sm text-gray-900">{meeting.title}</p>
                        </div>
                        
                        {meeting.description && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                            <p className="text-sm text-gray-900">{meeting.description}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                            <p className="text-sm text-gray-900">{meeting.duration}分</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ミーティングタイプ</label>
                            <p className="text-sm text-gray-900">
                              {meeting.meetingType === "google_meet" ? "Google Meet" : "Zoom"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">営業時間</label>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            {Object.entries(meeting.businessHours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between">
                                <span className="capitalize">{
                                  day === 'monday' ? '月曜日' :
                                  day === 'tuesday' ? '火曜日' :
                                  day === 'wednesday' ? '水曜日' :
                                  day === 'thursday' ? '木曜日' :
                                  day === 'friday' ? '金曜日' :
                                  day === 'saturday' ? '土曜日' : '日曜日'
                                }:</span>
                                <span>
                                  {hours.enabled 
                                    ? `${hours.startTime} - ${hours.endTime}`
                                    : '休業日'
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}