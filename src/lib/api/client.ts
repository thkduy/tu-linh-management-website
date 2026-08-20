import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { authStore } from "@/features/auth/auth-store"
import type { ApiResponse, RefreshResult } from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
})

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = authStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Silent refresh (single-flight) ---
let refreshPromise: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  const refreshToken = authStore.getRefreshToken()
  if (!refreshToken) return null
  try {
    const res = await axios.post<ApiResponse<RefreshResult>>(
      `${BASE_URL}/api/v1/auth/refresh`,
      { refreshToken },
    )
    if (res.data.success) {
      authStore.setSession(res.data.data.session, null)
      return res.data.data.session.accessToken
    }
    return null
  } catch {
    return null
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

// Response interceptor: on 401, attempt silent refresh and retry once
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      }
      // refresh failed → clear and redirect
      authStore.clear()
      if (window.location.pathname !== "/login") {
        window.location.assign("/login")
      }
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined
    return data?.error?.message ?? error.message
  }
  if (error instanceof Error) return error.message
  return "An unexpected error occurred"
}
