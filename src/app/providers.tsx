"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Provider } from "jotai";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      
      if (!convexUrl) {
        setError("Convex URL not configured. Please set NEXT_PUBLIC_CONVEX_URL environment variable.");
        return;
      }

      const client = new ConvexReactClient(convexUrl);
      setConvexClient(client);
    } catch (err) {
      setError("Failed to initialize Convex client. Please check your configuration.");
      console.error("Convex initialization error:", err);
    }
  }, []);

  if (error) {
    return (
      <SessionProvider>
        <Provider>
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration Error</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="bg-gray-100 rounded p-4 text-left">
                <p className="text-sm text-gray-700 font-medium mb-2">To fix this:</p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Run: <code className="bg-gray-200 px-1 rounded">npx convex dev</code></li>
                  <li>2. Copy the Convex URL to your .env.local file</li>
                  <li>3. Restart the development server</li>
                </ol>
              </div>
            </div>
          </div>
        </Provider>
      </SessionProvider>
    );
  }

  if (!convexClient) {
    return (
      <SessionProvider>
        <Provider>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing application...</p>
            </div>
          </div>
        </Provider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <ConvexProvider client={convexClient}>
        <Provider>
          {children}
        </Provider>
      </ConvexProvider>
    </SessionProvider>
  );
}