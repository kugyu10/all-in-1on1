"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Video, Search, Filter, MapPin } from "lucide-react";
import Link from "next/link";

export default function ParticipantsDashboard() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [upcomingBookings] = useState<{
    id: string;
    title: string;
    ownerName: string;
    ownerEmail: string;
    scheduledTime: Date;
    duration: number;
    meetingType: string;
    meetingLink: string;
    status: string;
  }[]>([]);

  const [availableMeetings] = useState<{
    id: string;
    title: string;
    description: string;
    ownerName: string;
    duration: number;
    meetingType: string;
    nextAvailable: Date;
  }[]>([]);

  const filteredMeetings = availableMeetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">参加者ダッシュボード</h1>
                <p className="text-gray-600">ミーティングを検索・予約し、予定を管理</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/owner">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>オーナービューに切り替え</span>
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
                <p className="text-sm font-medium text-gray-600">今後の予約</p>
                <p className="text-3xl font-bold text-gray-900">{upcomingBookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今月の参加</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">利用可能なミーティング</p>
                <p className="text-3xl font-bold text-gray-900">{availableMeetings.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">今後の予約</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      確定済み
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">ホスト: {booking.ownerName}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {booking.scheduledTime.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {booking.scheduledTime.toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} ({booking.duration}分)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {booking.meetingType === "google_meet" ? "Google Meet" : "Zoom"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(booking.meetingLink, '_blank')}
                    >
                      参加
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      詳細
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">予約がありません（0件）</h3>
              <p className="text-gray-600 mb-4">新しいミーティングを予約してみましょう</p>
            </div>
          )}
        </div>

        {/* Available Meetings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">利用可能なミーティング</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ミーティングを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>フィルター</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{meeting.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{meeting.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">ホスト: {meeting.ownerName}</span>
                  </div>

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
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      次回空き: {meeting.nextAvailable.toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <Link href={`/book/${meeting.id}`}>
                  <Button className="w-full">
                    予約する
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {filteredMeetings.length === 0 && searchTerm && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりません（0件）</h3>
              <p className="text-gray-600">別のキーワードで検索してみてください</p>
            </div>
          )}

          {filteredMeetings.length === 0 && !searchTerm && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">利用可能なミーティングがありません（0件）</h3>
              <p className="text-gray-600">現在予約可能なミーティングはありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}