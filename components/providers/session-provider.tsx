"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

/**
 * Client-side SessionProvider para NextAuth
 *
 * Envolve a aplicação para fornecer contexto de sessão
 * aos componentes client-side
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}
