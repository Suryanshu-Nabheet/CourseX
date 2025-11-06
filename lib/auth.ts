import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
import { users } from "./data/store"
import bcrypt from "bcryptjs"

// Validate NEXTAUTH_SECRET
if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    "⚠️  NEXTAUTH_SECRET is not set. JWT sessions will not work properly."
  )
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXTAUTH_SECRET environment variable is required in production"
    )
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = users.getByEmail(credentials.email) as any

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, user object is provided
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      // Ensure token always has id and role (preserve on refresh)
      // If token.id is missing, something went wrong but don't break the session
      return token
    },
    async session({ session, token }) {
      // Only add custom fields if token exists and has required data
      if (token && session.user) {
        if (token.id) {
          (session.user as any).id = token.id as string
        }
        if (token.role) {
          (session.user as any).role = token.role as string
        }
      }
      // Let NextAuth handle invalid tokens naturally - don't return null session
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Check if user exists, otherwise create
        const existingUser = users.getByEmail(user.email || "")
        if (!existingUser) {
          users.create({
            id: user.id || (profile as any).sub,
            name: user.name || (profile as any).name || user.email || "User",
            email: user.email || "",
            image: user.image || (profile as any).picture,
            role: "STUDENT",
            password: "", // Google users don't have passwords
            emailVerified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      // Suppress JWT_SESSION_ERROR logs - we handle these gracefully
      if (code === "JWT_SESSION_ERROR") {
        // Silently handle - we'll redirect to login anyway
        return
      }
      // Log other errors normally
      console.error(`[next-auth][error][${code}]`, metadata)
    },
  },
}

/**
 * Safely get server session with error handling for JWT decryption errors
 * This handles cases where the NEXTAUTH_SECRET has changed or is missing
 * NextAuth logs JWT errors internally but doesn't throw, so we need to:
 * 1. Check if NEXTAUTH_SECRET exists
 * 2. Handle invalid sessions gracefully
 * 3. Clear invalid cookies if needed
 */
export async function getSafeServerSession() {
  // Early return if NEXTAUTH_SECRET is missing
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn("⚠️  NEXTAUTH_SECRET is missing - sessions will not work")
    // Clear any existing session cookies
    try {
      const cookieStore = await cookies()
      cookieStore.delete("next-auth.session-token")
      cookieStore.delete("__Secure-next-auth.session-token")
    } catch {
      // Ignore cookie errors
    }
    return null
  }

  try {
    // Let NextAuth handle session validation - it will return null if invalid
    const session = await getServerSession(authOptions)
    
    // Debug: Log if session is missing (only in development)
    if (!session && process.env.NODE_ENV === "development") {
      console.log("🔍 No session found - user needs to log in")
    }
    
    return session
  } catch (error: any) {
    // Handle any thrown errors (though NextAuth usually doesn't throw)
    const errorMessage = error?.message || ""
    const errorCode = error?.code || ""
    
    if (
      errorMessage.includes("decryption") ||
      errorMessage.includes("JWT_SESSION_ERROR") ||
      errorMessage.includes("JWT") ||
      errorCode === "ERR_JWT_SESSION_ERROR" ||
      errorCode.includes("JWT")
    ) {
      // Clear invalid session cookies only on actual decryption errors
      try {
        const cookieStore = await cookies()
        cookieStore.delete("next-auth.session-token")
        cookieStore.delete("__Secure-next-auth.session-token")
      } catch {
        // Ignore cookie errors
      }
      return null
    }
    // Re-throw other errors
    throw error
  }
}
