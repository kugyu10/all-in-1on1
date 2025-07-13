import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            1on1 スケジューラー
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Googleカレンダー連携でスムーズな1on1ミーティング予約を実現するTimeRex風システム
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-orange-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">参加者向け</h2>
            </div>
            <p className="text-gray-600 mb-6">
              メールアドレスだけでミーティングを予約できます。利用可能な時間から選んで、即座に確認できます。
            </p>
            <Link 
              href="/participants" 
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
参加者として始める
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">機能</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Googleカレンダー連携</h3>
              <p className="text-gray-600">Googleカレンダーと自動で同期</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">簡単予約</h3>
              <p className="text-gray-600">参加者はメールアドレスだけで簡単予約</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Zoom & Meet</h3>
              <p className="text-gray-600">ZoomやGoogle Meetと連携</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
