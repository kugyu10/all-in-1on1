# All-in-1on1 アーキテクチャ仕様書

## プロジェクト概要
TimeRex風の1on1ミーティング予約システム。Next.js、Convex、NextAuthを使用したモダンなWebアプリケーション。

## 技術スタック

### フロントエンド
- **Next.js 15.3.5** (App Router)
- **React 19.0.0**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Jotai** (状態管理)
- **React Hook Form** + Zod (フォーム管理・バリデーション)
- **Lucide React** (アイコン)

### バックエンド・データベース
- **Convex** (リアルタイムデータベース・API)
- **NextAuth** (認証)
- **Google APIs** (Calendar統合)

### 開発・ビルドツール
- **ESLint**
- **PostCSS**
- **Turbopack** (開発時)

## プロジェクト構造

```
all-in-1on1/
├── convex/                    # Convexバックエンド
│   ├── _generated/           # 自動生成ファイル
│   ├── auth.ts              # 認証ロジック
│   ├── meetings.ts          # ミーティング関連API
│   ├── schema.ts            # データベーススキーマ
│   └── users.ts             # ユーザー関連API
├── public/                   # 静的アセット
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes
│   │   │   ├── auth/        # NextAuth設定
│   │   │   └── calendar/    # Google Calendar API
│   │   ├── auth/            # 認証ページ
│   │   ├── book/            # 予約ページ
│   │   ├── dashboard/       # ダッシュボード
│   │   ├── owner/           # オーナー機能
│   │   └── participants/    # 参加者機能
│   ├── components/          # React コンポーネント
│   │   └── ui/              # UIコンポーネント
│   ├── lib/                 # ユーティリティ・設定
│   ├── types/               # TypeScript型定義
│   └── middleware.ts        # NextAuth middleware
├── package.json
├── tsconfig.json
└── 設定ファイル群
```

## データベーススキーマ

### users テーブル
- name: string
- email: string (インデックス)
- googleId?: string (インデックス)
- profileImage?: string
- isOwner: boolean
- createdAt: number

### meetings テーブル
- title: string
- description?: string
- ownerId: users._id (インデックス)
- duration: number (分)
- availableSlots?: 時間枠配列
- businessHours: 曜日別営業時間設定
- meetingType: "zoom" | "google_meet"
- isActive: boolean
- createdAt: number

### bookings テーブル
- meetingId: meetings._id (インデックス)
- attendeeEmail: string (インデックス)
- attendeeName: string
- scheduledTime: number
- status: "scheduled" | "cancelled" | "completed"
- meetingLink?: string
- createdAt: number

### googleCalendarIntegration テーブル
- userId: users._id (インデックス)
- accessToken: string
- refreshToken: string
- calendarId: string
- expiresAt: number
- createdAt: number

## 主要機能

### 認証システム
- **NextAuth 4.24.11** を使用
- Google OAuth 2.0 認証
- Google Calendar API連携用スコープ
- 保護されたルート: `/owner/*`, `/participants/*`

### ルーティング構造
- `/` - ランディングページ
- `/auth/signin` - サインインページ
- `/auth/error` - 認証エラーページ
- `/owner` - オーナーダッシュボード
- `/owner/create` - ミーティング作成
- `/participants` - 参加者ダッシュボード
- `/book/[meetingId]` - 予約ページ
- `/dashboard` - 共通ダッシュボード

### 状態管理
- **Jotai** による原子的状態管理
- **SessionProvider** (NextAuth)
- **ConvexProvider** (リアルタイムデータ)
- **Provider** (Jotai)

### エラーハンドリング
- ErrorBoundary コンポーネント
- Convex初期化エラー処理
- 設定不備時の詳細エラー表示

## 外部API連携

### Google Calendar API
- 読み取り専用スコープ
- アクセストークン・リフレッシュトークン管理
- カレンダーイベント取得

### Convex リアルタイムAPI
- サーバーレス関数
- リアルタイムデータ同期
- 型安全なAPI

## セキュリティ

### 認証・認可
- NextAuth middleware による保護
- JWT トークンベース認証
- Google OAuth 2.0

### 環境変数
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXTAUTH_SECRET
- NEXT_PUBLIC_CONVEX_URL

## 開発環境

### 開発サーバー
```bash
npm run dev        # Next.js開発サーバー (Turbopack)
npm run convex     # Convex開発環境
```

### ビルド・リント
```bash
npm run build      # プロダクションビルド
npm run lint       # ESLintチェック
```

## デプロイメント
- Vercel Platform 推奨
- Convex クラウドサービス
- 環境変数設定必須