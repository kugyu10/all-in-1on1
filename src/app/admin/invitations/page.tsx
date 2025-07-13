"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserPlus, Shield, User, ArrowLeft, Copy, Trash2, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InvitationsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    role: "owner" as "owner" | "admin",
    expiresInHours: 24,
  });
  
  const currentUser = useQuery(
    api.users.getByEmail, 
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  
  const allInvitations = useQuery(api.invitations.getAllInvitations);
  const allUsers = useQuery(api.users.getAllUsers);
  const createInvitation = useMutation(api.invitations.createInvitation);
  const deleteInvitation = useMutation(api.invitations.deleteInvitation);

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

  const handleCreateInvitation = async () => {
    if (!currentUser) return;

    try {
      const result = await createInvitation({
        email: newInvitation.email || undefined,
        role: newInvitation.role,
        expiresInHours: newInvitation.expiresInHours,
        createdBy: currentUser._id as any,
      });

      // URLをクリップボードにコピー
      await navigator.clipboard.writeText(result.url);
      alert(`招待URLが作成されました！\nクリップボードにコピーしました。\n\nURL: ${result.url}`);

      setShowCreateForm(false);
      setNewInvitation({
        email: "",
        role: "owner",
        expiresInHours: 24,
      });
    } catch (error) {
      console.error("招待URL作成に失敗:", error);
      alert("招待URL作成に失敗しました");
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!currentUser) return;
    if (!confirm("この招待を削除しますか？")) return;

    try {
      await deleteInvitation({
        invitationId: invitationId as any,
        deletedBy: currentUser._id as any,
      });
    } catch (error) {
      console.error("招待削除に失敗:", error);
      alert("招待削除に失敗しました");
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URLをクリップボードにコピーしました");
    } catch (error) {
      console.error("コピーに失敗:", error);
      alert("コピーに失敗しました");
    }
  };

  const getCreatorName = (createdBy: string) => {
    const creator = allUsers?.find(user => user._id === createdBy);
    return creator ? creator.name : "不明";
  };

  const getUsedByName = (usedBy: string) => {
    const user = allUsers?.find(user => user._id === usedBy);
    return user ? user.name : "不明";
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
            <UserPlus className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">招待管理</h1>
              <p className="text-gray-600">オーナーと管理者の招待URLを管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 招待作成 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">新しい招待を作成</h2>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>招待作成</span>
            </Button>
          </div>

          {showCreateForm && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス（任意）
                  </label>
                  <input
                    type="email"
                    value={newInvitation.email}
                    onChange={(e) => setNewInvitation({...newInvitation, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    placeholder="特定のユーザー用の場合のみ入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    権限
                  </label>
                  <select
                    value={newInvitation.role}
                    onChange={(e) => setNewInvitation({...newInvitation, role: e.target.value as "owner" | "admin"})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  >
                    <option value="owner">オーナー</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    有効期限（時間）
                  </label>
                  <select
                    value={newInvitation.expiresInHours}
                    onChange={(e) => setNewInvitation({...newInvitation, expiresInHours: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  >
                    <option value={1}>1時間</option>
                    <option value={6}>6時間</option>
                    <option value={24}>24時間</option>
                    <option value={72}>72時間</option>
                    <option value={168}>1週間</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleCreateInvitation}>
                  招待URLを作成
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 招待一覧 */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">招待一覧</h2>
            <p className="text-sm text-gray-600 mt-1">
              作成済み招待: {allInvitations?.length || 0}件
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    権限・対象
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    有効期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allInvitations?.map((invitation) => {
                  const isExpired = invitation.expiresAt < Date.now();
                  const inviteUrl = `${window.location.origin}/invite/${invitation.token}`;
                  
                  return (
                    <tr key={invitation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center space-x-2">
                            {invitation.role === "admin" ? (
                              <Shield className="h-4 w-4 text-red-600" />
                            ) : (
                              <User className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {invitation.role === "admin" ? "管理者" : "オーナー"}
                            </span>
                          </div>
                          {invitation.email && (
                            <div className="text-sm text-gray-500">
                              {invitation.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {invitation.isUsed ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="text-sm text-green-600 font-medium">使用済み</div>
                                <div className="text-xs text-gray-500">
                                  {getUsedByName(invitation.usedBy!)}
                                </div>
                              </div>
                            </>
                          ) : isExpired ? (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-600 font-medium">期限切れ</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">有効</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invitation.expiresAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCreatorName(invitation.createdBy)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!invitation.isUsed && !isExpired && (
                            <button
                              onClick={() => copyToClipboard(inviteUrl)}
                              className="text-blue-600 hover:text-blue-900"
                              title="URLをコピー"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvitation(invitation._id)}
                            className="text-red-600 hover:text-red-900"
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {allInvitations?.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">招待がありません</h3>
              <p className="text-gray-600">新しい招待を作成してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}