import type { AuthSession, Profile } from "@/types"

const STORAGE_KEY = "tulin.auth"

interface StoredAuth {
  accessToken: string
  refreshToken: string
  expiresAt: string
  profile: Profile | null
}

function read(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

function write(auth: StoredAuth | null) {
  if (auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const authStore = {
  getAccessToken(): string | null {
    return read()?.accessToken ?? null
  },
  getRefreshToken(): string | null {
    return read()?.refreshToken ?? null
  },
  getProfile(): Profile | null {
    return read()?.profile ?? null
  },
  isAuthenticated(): boolean {
    return Boolean(read()?.accessToken)
  },
  setSession(session: AuthSession, profile: Profile | null) {
    const existing = read()
    write({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      profile: profile ?? existing?.profile ?? null,
    })
  },
  setProfile(profile: Profile) {
    const existing = read()
    if (!existing) return
    write({ ...existing, profile })
  },
  clear() {
    write(null)
  },
}
