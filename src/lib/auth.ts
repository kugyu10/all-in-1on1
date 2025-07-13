import GoogleProvider from "next-auth/providers/google";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../convex/_generated/api";

// const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
            access_type: "offline",
            prompt: "consent"
          },
        },
      })
    ] : []),
  ],
  callbacks: {
    // @ts-expect-error NextAuth callback types
    async signIn({ user, account }) {
      // TODO: Implement Convex user creation on client-side
      console.log("User signed in:", user, account);
      return true;
    },
    // @ts-expect-error NextAuth callback types
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
        accessToken: token.accessToken,
      };
    },
    // @ts-expect-error NextAuth callback types
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // アクセストークンの期限切れをチェック
      if (token.expiresAt && Date.now() > (token.expiresAt as number) * 1000) {
        try {
          // リフレッシュトークンを使ってアクセストークンを更新
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });
          
          const refreshedTokens = await response.json();
          
          if (!response.ok) {
            throw refreshedTokens;
          }
          
          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret",
};