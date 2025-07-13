"use client";

import { useSession, signOut } from "next-auth/react";
import { Calendar, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">All in 1on1</h1>
          </Link>
          
          {session ? (
            <div className="flex items-center space-x-4">
              <Link href="/user/profile" className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">{session.user?.name}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>ログアウト</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  ログイン
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}