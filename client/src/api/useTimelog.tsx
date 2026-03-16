import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from "@tanstack/react-query";
import {
  timelogApi,
  type TimelogFilters,
  type WeeklyApprovalSummary,
  type BulkReviewWeekPayload
} from "./timelogApi";
import type {
  Timelog,
  CreateTimelogData,
  UpdateTimelogData,
  ApproveTimelogData
} from "@/types/Timelog.model";

// Query keys
export const timelogKeys = {
  all: ["timelogs"] as const,
  lists: () => [...timelogKeys.all, "list"] as const,
  list: (filters?: TimelogFilters) =>
    [...timelogKeys.lists(), filters] as const,
  details: () => [...timelogKeys.all, "detail"] as const,
  detail: (id: string) => [...timelogKeys.details(), id] as const,
  byEmployee: (
    employeeId: string,
    filters?: Omit<TimelogFilters, "employeeId">
  ) => [...timelogKeys.all, "employee", employeeId, filters] as const,
  byWeek: (
    startDate: string,
    endDate: string,
    filters?: Omit<TimelogFilters, "startDate" | "endDate">
  ) => [...timelogKeys.all, "week", startDate, endDate, filters] as const,
  byEmployeeAndWeek: (
    employeeId: string,
    startDate: string,
    endDate: string,
    filters?: Omit<TimelogFilters, "employeeId" | "startDate" | "endDate">
  ) =>
    [
      ...timelogKeys.all,
      "employee",
      employeeId,
      "week",
      startDate,
      endDate,
      filters
    ] as const,
  byEntity: (entityId: string, filters?: Omit<TimelogFilters, "entityId">) =>
    [...timelogKeys.all, "entity", entityId, filters] as const,
  summary: (params: {
    employeeId?: string;
    entityId?: string;
    startDate: string;
    endDate: string;
  }) => [...timelogKeys.all, "summary", params] as const,
  weeklyApprovals: (weekStart: string, weekEnd: string) =>
    [...timelogKeys.all, "weekly-approvals", weekStart, weekEnd] as const
};

// Get all timelogs
export const useTimelogs = (
  filters?: TimelogFilters,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof timelogApi.getAll>>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: timelogKeys.list(filters),
    queryFn: () => timelogApi.getAll(filters),
    ...options
  });
};

// Get single timelog
export const useTimelog = (
  id: string,
  options?: Omit<UseQueryOptions<Timelog>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: timelogKeys.detail(id),
    queryFn: () => timelogApi.getById(id),
    enabled: !!id,
    ...options
  });
};

// Get timelogs by employee
export const useTimelogsByEmployee = (
  employeeId: string,
  filters?: Omit<TimelogFilters, "employeeId">,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof timelogApi.getByEmployee>>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: timelogKeys.byEmployee(employeeId, filters),
    queryFn: () => timelogApi.getByEmployee(employeeId, filters),
    enabled: !!employeeId,
    ...options
  });
};

// Get timelogs by week
export const useTimelogsByWeek = (
  startDate: string,
  endDate: string,
  filters?: Omit<TimelogFilters, "startDate" | "endDate">,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof timelogApi.getByWeek>>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: timelogKeys.byWeek(startDate, endDate, filters),
    queryFn: () => timelogApi.getByWeek(startDate, endDate, filters),
    enabled: !!startDate && !!endDate,
    ...options
  });
};

// Get timelogs by employee and week
export const useTimelogsByEmployeeAndWeek = (
  employeeId: string,
  startDate: string,
  endDate: string,
  filters?: Omit<TimelogFilters, "employeeId" | "startDate" | "endDate">,
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof timelogApi.getByEmployeeAndWeek>>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: timelogKeys.byEmployeeAndWeek(
      employeeId,
      startDate,
      endDate,
      filters
    ),
    queryFn: () =>
      timelogApi.getByEmployeeAndWeek(employeeId, startDate, endDate, filters),
    enabled: !!employeeId && !!startDate && !!endDate,
    ...options
  });
};

// Get timelogs by entity
export const useTimelogsByEntity = (
  entityId: string,
  filters?: Omit<TimelogFilters, "entityId">,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof timelogApi.getByEntity>>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: timelogKeys.byEntity(entityId, filters),
    queryFn: () => timelogApi.getByEntity(entityId, filters),
    enabled: !!entityId,
    ...options
  });
};

// Get timelog summary
export const useTimelogSummary = (
  params: {
    employeeId?: string;
    entityId?: string;
    startDate: string;
    endDate: string;
  },
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof timelogApi.getSummary>>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: timelogKeys.summary(params),
    queryFn: () => timelogApi.getSummary(params),
    enabled: !!params.startDate && !!params.endDate,
    ...options
  });
};

// Create timelog mutation
export const useCreateTimelog = (
  options?: UseMutationOptions<Timelog, Error, CreateTimelogData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timelogApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: timelogKeys.byEmployee(data.employeeId)
      });
      if (data.entityId) {
        queryClient.invalidateQueries({
          queryKey: timelogKeys.byEntity(data.entityId)
        });
      }
    },
    ...options
  });
};

// Update timelog mutation
export const useUpdateTimelog = (
  options?: UseMutationOptions<
    Timelog,
    Error,
    { id: string; data: UpdateTimelogData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => timelogApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: timelogKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: timelogKeys.byEmployee(data.employeeId)
      });
      if (data.entityId) {
        queryClient.invalidateQueries({
          queryKey: timelogKeys.byEntity(data.entityId)
        });
      }
    },
    ...options
  });
};

// Patch timelog mutation
export const usePatchTimelog = (
  options?: UseMutationOptions<
    Timelog,
    Error,
    { id: string; data: Partial<UpdateTimelogData> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => timelogApi.patch(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: timelogKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: timelogKeys.byEmployee(data.employeeId)
      });
      if (data.entityId) {
        queryClient.invalidateQueries({
          queryKey: timelogKeys.byEntity(data.entityId)
        });
      }
    },
    ...options
  });
};

// Delete timelog mutation
export const useDeleteTimelog = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timelogApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.all });
    },
    ...options
  });
};

// Submit timelog mutation
export const useSubmitTimelog = (
  options?: UseMutationOptions<Timelog, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timelogApi.submit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: timelogKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: timelogKeys.byEmployee(data.employeeId)
      });
    },
    ...options
  });
};

// Approve timelog mutation
export const useApproveTimelog = (
  options?: UseMutationOptions<
    Timelog,
    Error,
    { id: string; data?: ApproveTimelogData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => timelogApi.approve(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: timelogKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: timelogKeys.byEmployee(data.employeeId)
      });
    },
    ...options
  });
};

// Reject timelog mutation
export const useRejectTimelog = (
  options?: UseMutationOptions<
    Timelog,
    Error,
    { id: string; rejectionReason: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionReason }) =>
      timelogApi.reject(id, rejectionReason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: timelogKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: timelogKeys.byEmployee(data.employeeId)
      });
    },
    ...options
  });
};

// Bulk submit timelogs mutation
export const useBulkSubmitTimelogs = (
  options?: UseMutationOptions<
    { success: boolean; updated: number },
    Error,
    string[]
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timelogApi.bulkSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.all });
    },
    ...options
  });
};

// Bulk approve timelogs mutation
export const useBulkApproveTimelogs = (
  options?: UseMutationOptions<
    { success: boolean; updated: number },
    Error,
    { timelogIds: string[]; approvalData?: ApproveTimelogData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ timelogIds, approvalData }) =>
      timelogApi.bulkApprove(timelogIds, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.all });
    },
    ...options
  });
};

// Weekly approvals summary (manager/owner/admin view)
export const useWeeklyApprovals = (
  weekStart: string,
  weekEnd: string,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof timelogApi.getWeeklyApprovals>>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: timelogKeys.weeklyApprovals(weekStart, weekEnd),
    queryFn: () => timelogApi.getWeeklyApprovals({ weekStart, weekEnd }),
    enabled: !!weekStart && !!weekEnd,
    ...options
  });
};

// Bulk review (approve or reject) all timelogs for an employee in a week
export const useBulkReviewWeek = (
  options?: UseMutationOptions<
    { success: boolean; updated: number },
    Error,
    BulkReviewWeekPayload
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timelogApi.bulkReviewWeek,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelogKeys.all });
    },
    ...options
  });
};

export type { WeeklyApprovalSummary, BulkReviewWeekPayload };
