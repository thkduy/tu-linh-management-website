import { apiClient } from "./client"
import type {
  ApiResponse,
  CreateUserPayload,
  ListUsersParams,
  Pagination,
  Profile,
  UpdateStatusPayload,
  UpdateUserPayload,
} from "@/types"

export interface ListUsersResult {
  users: Profile[]
  pagination: Pagination
}

export async function listUsers(
  params: ListUsersParams,
): Promise<ListUsersResult> {
  const res = await apiClient.get<ApiResponse<Profile[]>>("/users", { params })
  if (!res.data.success) throw new Error(res.data.error.message)
  return {
    users: res.data.data,
    pagination: res.data.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: res.data.data.length,
      totalPages: 1,
    },
  }
}

export async function getUserById(id: string): Promise<Profile> {
  const res = await apiClient.get<ApiResponse<Profile>>(`/users/${id}`)
  if (!res.data.success) throw new Error(res.data.error.message)
  return res.data.data
}

export async function createUser(payload: CreateUserPayload): Promise<Profile> {
  const res = await apiClient.post<ApiResponse<Profile>>("/users", payload)
  if (!res.data.success) throw new Error(res.data.error.message)
  return res.data.data
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<Profile> {
  const res = await apiClient.patch<ApiResponse<Profile>>(`/users/${id}`, payload)
  if (!res.data.success) throw new Error(res.data.error.message)
  return res.data.data
}

export async function updateUserStatus(
  id: string,
  payload: UpdateStatusPayload,
): Promise<Profile> {
  const res = await apiClient.patch<ApiResponse<Profile>>(
    `/users/${id}/status`,
    payload,
  )
  if (!res.data.success) throw new Error(res.data.error.message)
  return res.data.data
}
