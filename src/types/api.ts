import type { Profile, Role, UserStatus } from "./auth"

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SuccessEnvelope<T> {
  success: true
  data: T
  message: string
  pagination?: Pagination
}

export interface ErrorEnvelope {
  success: false
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T> = SuccessEnvelope<T> | ErrorEnvelope

export type SortBy = "full_name" | "email" | "employee_code" | "created_at"
export type SortOrder = "asc" | "desc"

export interface ListUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: Role
  status?: UserStatus
  sortBy?: SortBy
  sortOrder?: SortOrder
}

export interface CreateUserPayload {
  fullName: string
  employeeCode: string
  email?: string
  password?: string
  role?: Role
  status?: UserStatus
  department?: string
  position?: string
}

export interface UpdateUserPayload {
  fullName?: string
  employeeCode?: string
  role?: Role
  status?: UserStatus
  department?: string
  position?: string
}

export interface UpdateStatusPayload {
  status: UserStatus
}

export type { Profile, Role, UserStatus }
