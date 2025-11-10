import "next-auth"
import "next-auth/jwt"

/**
 * Estender tipos do NextAuth para incluir o userId
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
  }
}
