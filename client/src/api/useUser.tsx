import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import { userApi } from "./userApi";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ListUsersResponse
} from "@/types/User.model";

// ─── Query keys ──────────────────────────────────────────────────────────────

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: object) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useUsers = (
  params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  },
  options?: Omit<UseQueryOptions<ListUsersResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.list(params),
    ...options
  });
};

export const useUser = (
  id: string,
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.get(id),
    enabled: !!id,
    ...options
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const useCreateUser = (
  options?: UseMutationOptions<User, Error, CreateUserPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.create(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      return options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled
  });
};

export const useUpdateUser = (
  options?: UseMutationOptions<
    User,
    Error,
    { id: string; payload: UpdateUserPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userApi.update(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(args[1].id) });
      return options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled
  });
};

export const useDeleteUser = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(args[1]) });
      return options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled
  });
};
