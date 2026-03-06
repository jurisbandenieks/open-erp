import { axiosClient } from "./client";
import type {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData
} from "@/types/Employee.model";

const EMPLOYEE_ENDPOINT = "/employees";

export const employeeApi = {
  // Get all employees with optional filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  }) => {
    const { data } = await axiosClient.get<{
      data: Employee[];
      total: number;
      page: number;
      limit: number;
    }>(EMPLOYEE_ENDPOINT, { params });
    return data;
  },

  // Get single employee by ID
  getById: async (id: string) => {
    const { data } = await axiosClient.get<Employee>(
      `${EMPLOYEE_ENDPOINT}/${id}`
    );
    return data;
  },

  // Create new employee
  create: async (employeeData: CreateEmployeeData) => {
    const { data } = await axiosClient.post<Employee>(
      EMPLOYEE_ENDPOINT,
      employeeData
    );
    return data;
  },

  // Update employee
  update: async (id: string, employeeData: UpdateEmployeeData) => {
    const { data } = await axiosClient.put<Employee>(
      `${EMPLOYEE_ENDPOINT}/${id}`,
      employeeData
    );
    return data;
  },

  // Partially update employee
  patch: async (id: string, employeeData: Partial<UpdateEmployeeData>) => {
    const { data } = await axiosClient.patch<Employee>(
      `${EMPLOYEE_ENDPOINT}/${id}`,
      employeeData
    );
    return data;
  },

  // Delete employee
  delete: async (id: string) => {
    const { data } = await axiosClient.delete(`${EMPLOYEE_ENDPOINT}/${id}`);
    return data;
  },

  // Get employee's managers
  getManagers: async (id: string) => {
    const { data } = await axiosClient.get(
      `${EMPLOYEE_ENDPOINT}/${id}/managers`
    );
    return data;
  },

  // Assign managers to employee
  assignManagers: async (id: string, managerIds: string[]) => {
    const { data } = await axiosClient.post(
      `${EMPLOYEE_ENDPOINT}/${id}/managers`,
      {
        managerIds
      }
    );
    return data;
  },

  // Get employee's managees
  getManagees: async (id: string) => {
    const { data } = await axiosClient.get(`${EMPLOYEE_ENDPOINT}/${id}/managees`);
    return data;
  },

  // Assign managees to employee
  assignManagees: async (id: string, manageeIds: string[]) => {
    const { data } = await axiosClient.post(
      `${EMPLOYEE_ENDPOINT}/${id}/managees`,
      { manageeIds }
    );
    return data;
  },

  // Get employee's timelogs
  getTimelogs: async (
    id: string,
    params?: { dateFrom?: string; dateTo?: string }
  ) => {
    const { data } = await axiosClient.get(
      `${EMPLOYEE_ENDPOINT}/${id}/timelogs`,
      {
        params
      }
    );
    return data;
  },

  // Get employee's absences
  getAbsences: async (
    id: string,
    params?: { year?: number; status?: string }
  ) => {
    const { data } = await axiosClient.get(
      `${EMPLOYEE_ENDPOINT}/${id}/absences`,
      {
        params
      }
    );
    return data;
  },

  // Get employee's time in lieu
  getTimeInLieus: async (id: string, params?: { status?: string }) => {
    const { data } = await axiosClient.get(
      `${EMPLOYEE_ENDPOINT}/${id}/time-in-lieus`,
      {
        params
      }
    );
    return data;
  }
};
