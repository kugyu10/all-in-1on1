import { withAuth } from "next-auth/middleware";

export default withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function middleware(_req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        if (req.nextUrl.pathname.startsWith("/owner") || req.nextUrl.pathname.startsWith("/participants")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/owner/:path*", "/participants/:path*"],
};