"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, Shield, User, Settings, Trash2, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UsersManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  
  const currentUser = useQuery(
    api.users.getByEmail, 
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  
  const allUsers = useQuery(api.users.getAllUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const deleteUser = useMutation(api.users.deleteUser);

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

  const handleRoleUpdate = async (userId: string, isOwner?: boolean, isAdmin?: boolean) => {
    try {
      await updateUserRole({
        userId: userId as any,
        isOwner,
        isAdmin,
      });
      setEditingUser(null);
    } catch (error) {
      console.error("ユーザー権限の更新に失敗:", error);
      alert("ユーザー権限の更新に失敗しました");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("このユーザーを削除しますか？この操作は取り消せません。")) {
      return;
    }

    try {
      await deleteUser({
        userId: userId as any,
      });
    } catch (error) {
      console.error("ユーザーの削除に失敗:", error);
      alert("ユーザーの削除に失敗しました");
    }
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
            <Users className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
              <p className="text-gray-600">ユーザーの権限とアカウントを管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ユーザー一覧 */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">登録ユーザー一覧</h2>
            <p className="text-sm text-gray-600 mt-1">
              総ユーザー数: {allUsers?.length || 0}人
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    権限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers?.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profileImage}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Shield className="h-3 w-3 mr-1" />
                            管理者
                          </span>
                        )}
                        {user.isOwner && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Settings className="h-3 w-3 mr-1" />
                            オーナー
                          </span>
                        )}
                        {!user.isAdmin && !user.isOwner && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            一般ユーザー
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === user._id ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleRoleUpdate(user._id, !user.isOwner, user.isAdmin)}
                            size="sm"
                            variant={user.isOwner ? "destructive" : "default"}
                          >
                            {user.isOwner ? "オーナー解除" : "オーナー付与"}
                          </Button>
                          <Button
                            onClick={() => handleRoleUpdate(user._id, user.isOwner, !user.isAdmin)}
                            size="sm"
                            variant={user.isAdmin ? "destructive" : "default"}
                          >
                            {user.isAdmin ? "管理者解除" : "管理者付与"}
                          </Button>
                          <Button
                            onClick={() => setEditingUser(null)}
                            size="sm"
                            variant="outline"
                          >
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user._id !== currentUser._id && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allUsers?.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
              <p className="text-gray-600">まだユーザーが登録されていません。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}