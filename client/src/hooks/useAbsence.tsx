import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { absenceApi } from "../api/absenceApi";
import type {
  AbsenceFilters,
  CreateAbsenceData,
  UpdateAbsenceData,
  ReviewAbsenceData
} from "@/types/Absence.model";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const absenceKeys = {
  all: ["absences"] as const,
  lists: () => [...absenceKeys.all, "list"] as const,
  list: (filters?: AbsenceFilters) =>
    [...absenceKeys.lists(), filters] as const,
  details: () => [...absenceKeys.all, "detail"] as const,
  detail: (id: string) => [...absenceKeys.details(), id] as const,
  byEmployee: (
    employeeId: string,
    params?: { year?: number; status?: string }
  ) => [...absenceKeys.all, "employee", employeeId, params] as const,
  balance: (employeeId: string, year?: number) =>
    [...absenceKeys.all, "balance", employeeId, year] as const
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useAbsences = (
  filters?: AbsenceFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: absenceKeys.list(filters),
    queryFn: () => absenceApi.getAll(filters),
    ...options
  });
};

export const useAbsence = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: absenceKeys.detail(id),
    queryFn: () => absenceApi.getById(id),
    enabled: !!id && options?.enabled !== false
  });
};

export const useAbsencesByEmployee = (
  employeeId: string,
  params?: { year?: number; status?: string },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: absenceKeys.byEmployee(employeeId, params),
    queryFn: () => absenceApi.getByEmployee(employeeId, params),
    enabled: !!employeeId && options?.enabled !== false
  });
};

export const useVacationBalance = (
  employeeId: string,
  year?: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: absenceKeys.balance(employeeId, year),
    queryFn: () => absenceApi.getVacationBalance(employeeId, year),
    enabled: !!employeeId && options?.enabled !== false
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAbsenceData) => absenceApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: absenceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: absenceKeys.byEmployee(data.employeeId)
      });
      queryClient.invalidateQueries({
        queryKey: absenceKeys.balance(data.employeeId)
      });
    }
  });
};

export const useUpdateAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAbsenceData }) =>
      absenceApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: absenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: absenceKeys.detail(data.id) });
      queryClient.invalidateQueries({
        queryKey: absenceKeys.byEmployee(data.employeeId)
      });
      queryClient.invalidateQueries({
        queryKey: absenceKeys.balance(data.employeeId)
      });
    }
  });
};

export const useDeleteAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => absenceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: absenceKeys.lists() });
    }
  });
};

export const useReviewAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewAbsenceData }) =>
      absenceApi.review(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: absenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: absenceKeys.detail(data.id) });
      queryClient.invalidateQueries({
        queryKey: absenceKeys.byEmployee(data.employeeId)
      });
      queryClient.invalidateQueries({
        queryKey: absenceKeys.balance(data.employeeId)
      });
    }
  });
};
