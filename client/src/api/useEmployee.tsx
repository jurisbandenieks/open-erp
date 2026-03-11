import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "./employeeApi";
import type {
  CreateEmployeeData,
  UpdateEmployeeData
} from "@/types/Employee.model";

const EMPLOYEE_KEYS = {
  all: ["employees"] as const,
  lists: () => [...EMPLOYEE_KEYS.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...EMPLOYEE_KEYS.lists(), filters] as const,
  details: () => [...EMPLOYEE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EMPLOYEE_KEYS.details(), id] as const,
  managers: (id: string) => [...EMPLOYEE_KEYS.detail(id), "managers"] as const,
  managees: (id: string) => [...EMPLOYEE_KEYS.detail(id), "managees"] as const,
  timelogs: (id: string, filters?: Record<string, any>) =>
    [...EMPLOYEE_KEYS.detail(id), "timelogs", filters] as const,
  absences: (id: string, filters?: Record<string, any>) =>
    [...EMPLOYEE_KEYS.detail(id), "absences", filters] as const,
  timeInLieus: (id: string, filters?: Record<string, any>) =>
    [...EMPLOYEE_KEYS.detail(id), "time-in-lieus", filters] as const
};

// Get all employees
export const useEmployees = (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(params),
    queryFn: () => employeeApi.getAll(params),
    ...options
  });
};

// Get single employee
export const useEmployee = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.detail(id),
    queryFn: () => employeeApi.getById(id),
    enabled: !!id && options?.enabled !== false
  });
};

// Get employee's managers
export const useEmployeeManagers = (
  id: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.managers(id),
    queryFn: () => employeeApi.getManagers(id),
    enabled: !!id && options?.enabled !== false
  });
};

// Get employee's timelogs
export const useEmployeeTimelogs = (
  id: string,
  params?: { dateFrom?: string; dateTo?: string },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.timelogs(id, params),
    queryFn: () => employeeApi.getTimelogs(id, params),
    enabled: !!id && options?.enabled !== false
  });
};

// Get employee's absences
export const useEmployeeAbsences = (
  id: string,
  params?: { year?: number; status?: string },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.absences(id, params),
    queryFn: () => employeeApi.getAbsences(id, params),
    enabled: !!id && options?.enabled !== false
  });
};

// Get employee's time in lieu
export const useEmployeeTimeInLieus = (
  id: string,
  params?: { status?: string },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.timeInLieus(id, params),
    queryFn: () => employeeApi.getTimeInLieus(id, params),
    enabled: !!id && options?.enabled !== false
  });
};

// Get the employee record of the currently logged-in user
export const useMyEmployee = () => {
  return useQuery({
    queryKey: [...EMPLOYEE_KEYS.all, "me"] as const,
    queryFn: () => employeeApi.me(),
    staleTime: 60_000
  });
};

// Create employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeData) => employeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    }
  });
};

// Update employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      employeeApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_KEYS.detail(data.id)
      });
    }
  });
};

// Patch employee
export const usePatchEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Partial<UpdateEmployeeData>;
    }) => employeeApi.patch(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_KEYS.detail(data.id)
      });
    }
  });
};

// Delete employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    }
  });
};

// Assign managers to employee
export const useAssignManagers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, managerIds }: { id: string; managerIds: string[] }) =>
      employeeApi.assignManagers(id, managerIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_KEYS.managers(variables.id)
      });
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_KEYS.detail(variables.id)
      });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    }
  });
};

// Assign managees to employee
export const useAssignManagees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, manageeIds }: { id: string; manageeIds: string[] }) =>
      employeeApi.assignManagees(id, manageeIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_KEYS.managees(variables.id)
      });
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_KEYS.detail(variables.id)
      });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    }
  });
};
