import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import { ownerApi } from "../api/ownerApi";
import type {
  Owner,
  CreateOwnerPayload,
  UpdateOwnerPayload
} from "@/types/Owner.model";

// ─── Query keys ──────────────────────────────────────────────────────────────

export const ownerKeys = {
  all: ["owners"] as const,
  lists: () => [...ownerKeys.all, "list"] as const,
  list: () => [...ownerKeys.lists()] as const,
  details: () => [...ownerKeys.all, "detail"] as const,
  detail: (id: string) => [...ownerKeys.details(), id] as const,
  me: () => [...ownerKeys.all, "me"] as const
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useOwners = (
  options?: Omit<UseQueryOptions<Owner[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ownerKeys.list(),
    queryFn: () => ownerApi.list(),
    ...options
  });
};

export const useOwner = (
  id: string,
  options?: Omit<UseQueryOptions<Owner>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ownerKeys.detail(id),
    queryFn: () => ownerApi.get(id),
    enabled: !!id,
    ...options
  });
};

export const useMyOwner = () => {
  return useQuery({
    queryKey: ownerKeys.me(),
    queryFn: () => ownerApi.me(),
    staleTime: 60_000
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const useCreateOwner = (
  options?: UseMutationOptions<Owner, Error, CreateOwnerPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOwnerPayload) => ownerApi.create(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      return options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled
  });
};

export const useUpdateOwner = (
  options?: UseMutationOptions<
    Owner,
    Error,
    { id: string; payload: UpdateOwnerPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateOwnerPayload;
    }) => ownerApi.update(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ownerKeys.detail(args[1].id) });
      return options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled
  });
};

export const useDeleteOwner = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ownerApi.remove(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.removeQueries({ queryKey: ownerKeys.detail(args[1]) });
      return options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled
  });
};
