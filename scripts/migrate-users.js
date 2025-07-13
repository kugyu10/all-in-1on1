// ユーザーテーブルにisAdminフィールドを追加し、初期管理者を設定するスクリプト

const { ConvexHttpClient } = require("convex/browser");
const fs = require('fs');
const path = require('path');

// .env.localファイルを読み込む
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, value] = trimmedLine.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  }
}

// .env.localを読み込み
loadEnvLocal();

// 環境変数からConvex URLを取得
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.error("NEXT_PUBLIC_CONVEX_URL が設定されていません");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function runMigration() {
  try {
    console.log("🔄 ユーザーテーブルにisAdminフィールドを追加中...");
    
    // 既存ユーザーにisAdminフィールドを追加
    const result = await client.mutation("migrations:addIsAdminField", {});
    console.log("✅", result.message);
    
    // 初期管理者の設定（必要に応じてメールアドレスを変更してください）
    const adminEmail = process.argv[2];
    
    if (adminEmail) {
      console.log(`🔄 ${adminEmail} を管理者に設定中...`);
      const adminResult = await client.mutation("migrations:makeUserAdmin", {
        email: adminEmail
      });
      console.log("✅", adminResult.message);
    } else {
      console.log("ℹ️  初期管理者を設定するには、メールアドレスを引数として渡してください：");
      console.log("   node scripts/migrate-users.js your-email@example.com");
    }
    
    console.log("🎉 マイグレーション完了！");
    
  } catch (error) {
    console.error("❌ マイグレーションエラー:", error);
    process.exit(1);
  }
}

runMigration();