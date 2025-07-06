"use client";

import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMeetingSchema, CreateMeetingInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Calendar, Video, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CreateMeeting() {
  const { data: session } = useSession();
  // const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<{ id: string; summary: string; start: { dateTime: string }; end: { dateTime: string } }[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  // const createMeeting = useMutation(api.meetings.create);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMeetingInput>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      duration: 30,
      meetingType: "google_meet",
      availableSlots: [],
      businessHours: {
        monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
        sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
      },
    },
  });

  const watchedMeetingType = useWatch({ control, name: "meetingType" });

  const onSubmit = async (data: CreateMeetingInput) => {
    setIsSubmitting(true);
    try {
      console.log("Creating meeting:", data);
      
      // デモ用の仮のミーティングID生成
      const meetingId = `meeting_${Date.now()}`;
      
      // 実際の実装では、ここでConvexのcreateMeetingを呼び出す
      // const meetingId = await createMeeting({
      //   title: data.title,
      //   description: data.description,
      //   duration: data.duration,
      //   meetingType: data.meetingType,
      //   businessHours: data.businessHours,
      //   ownerId: session?.user?.id,
      // });
      
      setCreatedMeetingId(meetingId);
      console.log("Meeting created with ID:", meetingId);
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("ミーティングタイプの作成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidSubmit = (errors: Record<string, unknown>) => {
    console.log("Validation errors:", errors);
  };

  // カレンダーデータを取得する関数
  const fetchCalendarData = async () => {
    setIsLoadingCalendar(true);
    try {
      // 実際の実装では、ここでGoogle Calendar APIからデータを取得
      // 現在はダミーデータを削除して空の配列を返す
      setCalendarEvents([]);
      console.log('カレンダーデータを取得しました: 0件');
    } catch (error) {
      console.error('カレンダーデータの取得エラー:', error);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCalendarData();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/owner">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>ダッシュボードに戻る</span>
              </Button>
            </Link>
            <Calendar className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">ミーティング種別を作成</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ミーティング詳細</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ミーティングタイトル *
                  </label>
                  <input
                    type="text"
                    {...register("title")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                    placeholder="例: 30分チャット"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明 (任意)
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                    placeholder="このミーティングについて説明してください..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時間 (分) *
                  </label>
                  <select
                    {...register("duration", { valueAsNumber: true })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                  >
                    <option value={15}>15分</option>
                    <option value={30}>30分</option>
                    <option value={45}>45分</option>
                    <option value={60}>60分</option>
                    <option value={90}>90分</option>
                    <option value={120}>120分</option>
                  </select>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ミーティング種別 *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="radio"
                        id="google_meet"
                        value="google_meet"
                        {...register("meetingType")}
                        className="sr-only"
                      />
                      <label
                        htmlFor="google_meet"
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          watchedMeetingType === "google_meet"
                            ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                            : "border-gray-300"
                        }`}
                      >
                        <Video className="h-5 w-5 text-orange-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Google Meet</div>
                          <div className="text-sm text-gray-600">ビデオ会議</div>
                        </div>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="radio"
                        id="zoom"
                        value="zoom"
                        {...register("meetingType")}
                        className="sr-only"
                      />
                      <label
                        htmlFor="zoom"
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          watchedMeetingType === "zoom"
                            ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                            : "border-gray-300"
                        }`}
                      >
                        <Video className="h-5 w-5 text-orange-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Zoom</div>
                          <div className="text-sm text-gray-600">ビデオ会議</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  {errors.meetingType && (
                    <p className="mt-1 text-sm text-red-600">{errors.meetingType.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">空き状況</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="font-medium text-orange-900">カレンダー連携</h3>
                </div>
                <p className="text-sm text-orange-700">
                  Googleカレンダーが連携されています。
                  {isLoadingCalendar ? (
                    <span className="inline-flex items-center ml-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-1"></div>
                      カレンダーデータを読み込み中...
                    </span>
                  ) : (
                    <span className="ml-2">
                      {calendarEvents.length}件のイベントを検出しました。
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  受付可能時間を設定
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  各曜日の受付可能時間を設定してください。カレンダーの空き時間でも、設定した時間外は受付けません。
                </p>

                {calendarEvents.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      カレンダーの予定 (今後7日間)
                    </h4>
                    <div className="space-y-2">
                      {calendarEvents.slice(0, 3).map((event: { id: string; summary: string; start: { dateTime: string } }) => (
                        <div key={event.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{event.summary}</span>
                          <span className="text-gray-500">
                            {new Date(event.start.dateTime).toLocaleDateString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ))}
                      {calendarEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center pt-2">
                          他 {calendarEvents.length - 3}件の予定
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => {
                    const dayLabels = {
                      monday: "月曜日",
                      tuesday: "火曜日", 
                      wednesday: "水曜日",
                      thursday: "木曜日",
                      friday: "金曜日",
                      saturday: "土曜日",
                      sunday: "日曜日"
                    };
                    
                    return (
                      <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-20 text-sm font-medium text-gray-700">
                          {dayLabels[day as keyof typeof dayLabels]}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${day}-enabled`}
                            {...register(`businessHours.${day}.enabled`)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day}-enabled`} className="text-sm text-gray-700">
                            受付可能
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            {...register(`businessHours.${day}.startTime`)}
                            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-600 focus:border-transparent text-sm text-gray-900"
                          />
                          <span className="text-sm text-gray-500">から</span>
                          <input
                            type="time"
                            {...register(`businessHours.${day}.endTime`)}
                            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-600 focus:border-transparent text-sm text-gray-900"
                          />
                          <span className="text-sm text-gray-500">まで</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {createdMeetingId ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-900">ミーティングタイプが作成されました！</h3>
                </div>
                <p className="text-green-700 mb-4">
                  参加者が予約できるURLを共有してください：
                </p>
                <div className="bg-white border border-green-200 rounded p-3 mb-4">
                  <code className="text-sm text-gray-800 break-all">
                    {`${window.location.origin}/book/${createdMeetingId}`}
                  </code>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/book/${createdMeetingId}`);
                      alert("URLをクリップボードにコピーしました！");
                    }}
                    className="flex items-center space-x-2"
                  >
                    <span>URLをコピー</span>
                  </Button>
                  <Link href="/owner">
                    <Button variant="outline">
                      ダッシュボードに戻る
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex justify-end space-x-4">
                <Link href="/owner">
                  <Button variant="outline" type="button">
                    キャンセル
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      <span>ミーティング種別を作成</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}