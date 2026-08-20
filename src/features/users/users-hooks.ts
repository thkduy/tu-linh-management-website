import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  updateUserStatus,
} from "@/lib/api/users"
import type {
  CreateUserPayload,
  ListUsersParams,
  UpdateStatusPayload,
  UpdateUserPayload,
} from "@/types"

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => listUsers(params),
    placeholderData: (prev) => prev,
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["users"] })
      qc.invalidateQueries({ queryKey: ["user", vars.id] })
    },
  })
}

export function useUpdateUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusPayload }) =>
      updateUserStatus(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["users"] })
      qc.invalidateQueries({ queryKey: ["user", vars.id] })
    },
  })
}
