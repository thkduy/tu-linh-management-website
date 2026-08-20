import { apiClient } from "./client"
import { authStore } from "@/features/auth/auth-store"
import type {
  ApiResponse,
  LoginResult,
  Profile,
  RefreshResult,
} from "@/types"

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const res = await apiClient.post<ApiResponse<LoginResult>>("/auth/login", {
    email,
    password,
  })
  if (!res.data.success) throw new Error(res.data.error.message)
  authStore.setSession(res.data.data.session, res.data.data.profile)
  return res.data.data
}

export async function refresh(refreshToken: string): Promise<RefreshResult> {
  const res = await apiClient.post<ApiResponse<RefreshResult>>("/auth/refresh", {
    refreshToken,
  })
  if (!res.data.success) throw new Error(res.data.error.message)
  return res.data.data
}

export async function me(): Promise<Profile> {
  const res = await apiClient.get<ApiResponse<Profile>>("/auth/me")
  if (!res.data.success) throw new Error(res.data.error.message)
  authStore.setProfile(res.data.data)
  return res.data.data
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post<ApiResponse<null>>("/auth/logout")
  } finally {
    authStore.clear()
  }
}
