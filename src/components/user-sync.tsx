"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
  const { data: session } = useSession();
  const upsertUser = useMutation(api.users.upsertUser);
  
  // ユーザーが既に存在するかチェック
  const existingUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  // デバッグ用ログ（開発時のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log("UserSync - Session:", session?.user?.email);
    console.log("UserSync - ExistingUser:", existingUser);
  }

  useEffect(() => {
    const syncUser = async () => {
      if (session?.user?.email && session?.user?.name) {
        // existingUserがnull（ユーザーが存在しない）の場合のみ作成
        if (existingUser === null) {
          try {
            await upsertUser({
              email: session.user.email,
              name: session.user.name,
              googleId: undefined,
              profileImage: session.user.image || undefined,
            });
            console.log("User created in Convex:", session.user.email);
          } catch (error) {
            console.error("Failed to create user in Convex:", error);
          }
        } else if (existingUser) {
          console.log("User already exists in Convex:", existingUser.email);
        }
      }
    };

    // セッションがあり、existingUserのクエリが完了している場合のみ実行
    if (session && existingUser !== undefined) {
      syncUser();
    }
  }, [session, existingUser, upsertUser]);

  return null; // このコンポーネントは何も表示しない
}