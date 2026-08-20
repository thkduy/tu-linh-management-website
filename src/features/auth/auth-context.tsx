import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { authStore } from "./auth-store"
import { me, logout as apiLogout } from "@/lib/api/auth"
import type { Profile } from "@/types"

interface AuthContextValue {
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  setAuthenticated: (value: boolean) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [isAuthenticated, setIsAuthenticated] = useState(
    authStore.isAuthenticated(),
  )

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: me,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60_000,
  })

  const logout = useCallback(async () => {
    await apiLogout()
    queryClient.clear()
    setIsAuthenticated(false)
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      profile: profileQuery.data ?? authStore.getProfile(),
      isAuthenticated,
      isLoading: isAuthenticated && profileQuery.isLoading,
      isAdmin: profileQuery.data?.role === "admin",
      setAuthenticated: setIsAuthenticated,
      logout,
    }),
    [profileQuery.data, profileQuery.isLoading, isAuthenticated, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
