declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      convexId?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}