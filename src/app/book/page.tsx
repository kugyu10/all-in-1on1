import { Calendar, Clock, Mail } from "lucide-react";

export default function BookMeeting() {
  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">ミーティングの予約</h1>
              <p className="text-gray-600">
                利用可能な時間を選択し、情報を入力してミーティングを予約してください。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
日付・時間を選択
                </h2>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">今日 14:00</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">30分</p>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">今日 15:30</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">30分</p>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">明日 10:00</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">30分</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-orange-600" />
あなたの情報
                </h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      お名前
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                      placeholder="フルネームを入力してください"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                      placeholder="メールアドレスを入力してください"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メッセージ（任意）
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                      rows={3}
                      placeholder="どのようなことを話し合いたいですか？"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
ミーティングを予約
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}