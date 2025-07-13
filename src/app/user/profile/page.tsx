"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Camera, Check, X, Edit3, Shield, Calendar } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileText, setProfileText] = useState("");
  const [tempProfileText, setTempProfileText] = useState("");
  const [userName, setUserName] = useState("");
  const [tempUserName, setTempUserName] = useState("");
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  
  const updateProfile = useMutation(api.users.updateProfile);
  const convexUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (convexUser) {
      setProfileText(convexUser.profileText || "");
      setUserName(convexUser.name || "");
      setConvexUserId(convexUser._id);
    } else if (session?.user) {
      setUserName(session.user.name || "");
    }
  }, [convexUser, session]);

  const handleProfileEditStart = () => {
    setTempProfileText(profileText);
    setIsEditingProfile(true);
  };

  const handleProfileEditCancel = () => {
    setTempProfileText("");
    setIsEditingProfile(false);
  };

  const handleProfileEditSave = async () => {
    if (tempProfileText.length > 200) {
      alert("プロフィール文は200文字以内で入力してください");
      return;
    }
    if (!convexUserId) {
      alert("ユーザー情報が見つかりません");
      return;
    }
    try {
      await updateProfile({
        id: convexUserId,
        profileText: tempProfileText,
      });
      setProfileText(tempProfileText);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("プロフィールの更新に失敗しました");
    }
  };

  const handleNameEditStart = () => {
    setTempUserName(userName);
    setIsEditingName(true);
  };

  const handleNameEditCancel = () => {
    setTempUserName("");
    setIsEditingName(false);
  };

  const handleNameEditSave = async () => {
    if (!tempUserName.trim()) {
      alert("名前を入力してください");
      return;
    }
    if (!convexUserId) {
      alert("ユーザー情報が見つかりません");
      return;
    }
    try {
      await updateProfile({
        id: convexUserId,
        name: tempUserName,
      });
      setUserName(tempUserName);
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name:", error);
      alert("名前の更新に失敗しました");
    }
  };

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <User className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
              <p className="text-gray-600">あなたの基本情報とアカウント設定</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* プロフィール基本情報 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start space-x-6">
              {/* アバターアイコン */}
              <div className="relative">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-600" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-2 text-white hover:bg-orange-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* 基本情報 */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      名前
                    </label>
                    {!isEditingName && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNameEditStart}
                        className="text-xs flex items-center space-x-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>編集</span>
                      </Button>
                    )}
                  </div>
                  {isEditingName ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={tempUserName}
                        onChange={(e) => setTempUserName(e.target.value)}
                        placeholder="名前を入力してください"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent text-gray-900"
                        maxLength={50}
                      />
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNameEditCancel}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-3 w-3" />
                          <span>キャンセル</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleNameEditSave}
                          className="flex items-center space-x-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>保存</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">
                      {userName || "名前が設定されていません"}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <div className="text-gray-900">
                    {session.user?.email || "メールアドレスが設定されていません"}
                  </div>
                </div>

                {/* Google認証の有無 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    認証状況
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Google認証済み</span>
                    </div>
                    {session.user?.image && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-600 font-medium">カレンダー連携済み</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* プロフィール文 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">プロフィール文</h2>
              {!isEditingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProfileEditStart}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>編集</span>
                </Button>
              )}
            </div>

            {isEditingProfile ? (
              <div>
                <textarea
                  value={tempProfileText}
                  onChange={(e) => setTempProfileText(e.target.value)}
                  placeholder="自己紹介文を入力してください（200文字以内）"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                  maxLength={200}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">
                    {tempProfileText.length}/200文字
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProfileEditCancel}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>キャンセル</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleProfileEditSave}
                      className="flex items-center space-x-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>保存</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {profileText ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {profileText}
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      まだプロフィール文が設定されていません
                    </p>
                    <Button
                      onClick={handleProfileEditStart}
                      className="flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>プロフィール文を追加</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* アカウント設定 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">アカウント設定</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Googleカレンダー連携</h3>
                  <p className="text-sm text-gray-600">カレンダーの予定と同期</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-medium">接続済み</span>
                  <Button variant="outline" size="sm">
                    再接続
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">通知設定</h3>
                  <p className="text-sm text-gray-600">予約確認とリマインダー</p>
                </div>
                <Button variant="outline" size="sm">
                  設定
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}