"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, User, Mail, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookMeetingSchema, BookMeetingInput } from "@/lib/validations";

export default function BookMeeting() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [ownerCalendarEvents, setOwnerCalendarEvents] = useState<{
    id: string;
    summary: string;
    start: Date;
    end: Date;
  }[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // const meeting = useQuery(api.meetings.getById, { meetingId: meetingId as any });
  
  // デモ用の仮データ
  const meeting = {
    id: meetingId,
    title: "30分チャット",
    description: "気軽にお話ししましょう",
    duration: 30,
    meetingType: "google_meet" as const,
    ownerId: "demo_owner",
    businessHours: {},
    isActive: true,
    createdAt: Date.now()
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookMeetingInput>({
    resolver: zodResolver(bookMeetingSchema),
    defaultValues: {
      meetingId,
    },
  });

  // 週間カレンダー用のヘルパー関数
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
    setSelectedTimeSlot(null); // 週を変更したら選択をリセット
  };

  // オーナーのカレンダーデータを取得する関数
  const fetchOwnerCalendar = React.useCallback(async () => {
    setIsLoadingCalendar(true);
    try {
      const weekStart = new Date(currentWeekStart);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const response = await fetch(`/api/calendar/events?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      
      const formattedEvents = data.events.map((event: {
        id: string;
        summary: string;
        start: string;
        end: string;
      }) => ({
        id: event.id,
        summary: event.summary,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setOwnerCalendarEvents(formattedEvents);
      console.log("オーナーカレンダーデータを取得:", formattedEvents);
    } catch (error) {
      console.error("カレンダーデータの取得エラー:", error);
      setOwnerCalendarEvents([]);
    } finally {
      setIsLoadingCalendar(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchOwnerCalendar();
  }, [currentWeekStart, fetchOwnerCalendar]);

  // オーナーの予定と重複しているかチェック
  const isTimeSlotBlocked = (slotTime: Date, slotDuration: number = 30) => {
    const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);
    
    return ownerCalendarEvents.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // スロットがイベントと重複している場合
      return (slotTime < eventEnd && slotEnd > eventStart);
    });
  };

  // デモ用の利用可能時間スロット生成
  const generateTimeSlots = () => {
    const slots: {
      time: Date;
      available: boolean;
      blockedReason: string | null;
    }[] = [];
    const weekDays = getWeekDays();
    
    weekDays.forEach((day, dayIndex) => {
      // 平日のみ（月〜金）
      if (dayIndex < 5) {
        // 9:00-17:00の間で30分刻み
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotTime = new Date(day);
            slotTime.setHours(hour, minute, 0, 0);
            
            // 過去の時間は除外
            if (slotTime > new Date()) {
              const isBlocked = isTimeSlotBlocked(slotTime, meeting.duration);
              slots.push({
                time: slotTime,
                available: !isBlocked, // オーナーの予定があれば利用不可
                blockedReason: isBlocked ? "オーナーの予定" : null,
              });
            }
          }
        }
      }
    });
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const onSubmit = async (data: BookMeetingInput) => {
    if (!selectedTimeSlot) {
      alert("時間帯を選択してください");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Booking meeting:", { ...data, scheduledTime: selectedTimeSlot });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBookingComplete(true);
    } catch (error) {
      console.error("Error booking meeting:", error);
      alert("予約に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!meeting) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ミーティング情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <Calendar className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            予約が完了しました！
          </h2>
          <p className="text-gray-600 mb-6">
            確認メールをお送りしました。ミーティングの詳細については、メールをご確認ください。
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            新しい予約をする
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
              <p className="text-gray-600">ミーティングを予約する</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ミーティング詳細 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ミーティング詳細</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-700">{meeting.duration}分</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Video className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-700">
                    {meeting.meetingType === "google_meet" ? "Google Meet" : "Zoom"}
                  </span>
                </div>
                
                {meeting.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">説明</h3>
                    <p className="text-gray-600">{meeting.description}</p>
                  </div>
                )}
              </div>
            </div>


            {/* ウィークリーカレンダービュー */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">利用可能な時間帯</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {currentWeekStart.toLocaleDateString('ja-JP', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} 〜
                  </span>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                  {isLoadingCalendar && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <span className="text-sm text-gray-500">読み込み中...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 週間カレンダーグリッド */}
              <div className="grid grid-cols-8 gap-2">
                {/* ヘッダー行（時間ラベル + 曜日） */}
                <div className="text-center py-2 text-sm font-medium text-gray-500">時間</div>
                {getWeekDays().map((day, index) => (
                  <div key={index} className="text-center py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {day.toLocaleDateString('ja-JP', { weekday: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.getDate()}
                    </div>
                  </div>
                ))}

                {/* 時間スロットグリッド */}
                {Array.from({ length: 16 }, (_, hourIndex) => {
                  const hour = 9 + Math.floor(hourIndex / 2);
                  const minute = (hourIndex % 2) * 30;
                  const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                  
                  return (
                    <React.Fragment key={hourIndex}>
                      {/* 時間ラベル */}
                      <div className="text-center py-3 text-xs text-gray-500 border-r border-gray-200">
                        {timeLabel}
                      </div>
                      
                      {/* 各曜日のスロット */}
                      {getWeekDays().map((day, dayIndex) => {
                        const slotTime = new Date(day);
                        slotTime.setHours(hour, minute, 0, 0);
                        const slotTimestamp = slotTime.getTime();
                        
                        const slot = timeSlots.find(s => s.time.getTime() === slotTimestamp);
                        const isAvailable = slot?.available && slotTime > new Date();
                        const isSelected = selectedTimeSlot === slotTimestamp;
                        const isWeekend = dayIndex >= 5;
                        const isBlocked = slot?.blockedReason;
                        
                        return (
                          <div key={dayIndex} className="relative">
                            {isAvailable ? (
                              <button
                                onClick={() => setSelectedTimeSlot(slotTimestamp)}
                                className={`w-full h-12 text-xs rounded border transition-colors ${
                                  isSelected
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                }`}
                              >
                                {isSelected ? "選択中" : "空き"}
                              </button>
                            ) : (
                              <div 
                                className={`w-full h-12 rounded border ${
                                  isWeekend 
                                    ? "bg-gray-100 border-gray-200" 
                                    : slotTime <= new Date()
                                    ? "bg-gray-50 border-gray-200"
                                    : isBlocked
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                                title={isBlocked ? `${isBlocked}: ${slot?.blockedReason}` : undefined}
                              >
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                  {isWeekend ? "休日" : 
                                   slotTime <= new Date() ? "過去" : 
                                   isBlocked ? "予定有" : "予約済"}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* 凡例 */}
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                  <span className="text-gray-600">空き</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">選択中</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                  <span className="text-gray-600">オーナー予定有</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                  <span className="text-gray-600">予約済</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                  <span className="text-gray-600">休日</span>
                </div>
              </div>
            </div>
          </div>

          {/* 予約フォーム */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">予約情報を入力</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  お名前 *
                </label>
                <input
                  type="text"
                  {...register("attendeeName")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                  placeholder="山田太郎"
                />
                {errors.attendeeName && (
                  <p className="mt-1 text-sm text-red-600">{errors.attendeeName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  メールアドレス *
                </label>
                <input
                  type="email"
                  {...register("attendeeEmail")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                  placeholder="yamada@example.com"
                />
                {errors.attendeeEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.attendeeEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  メッセージ (任意)
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                  placeholder="ミーティングについて事前に伝えたいことがあれば記入してください..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedTimeSlot}
                className="w-full flex items-center justify-center space-x-2"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>予約中...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>ミーティングを予約する</span>
                  </>
                )}
              </Button>

              {!selectedTimeSlot && (
                <p className="text-sm text-gray-500 text-center">
                  時間帯を選択してから予約してください
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}