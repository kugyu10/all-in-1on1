import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// @ts-expect-error NextAuth typing issue
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };