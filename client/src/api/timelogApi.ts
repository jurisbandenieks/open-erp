import { axiosClient } from "./client";
import type {
  Timelog,
  CreateTimelogData,
  UpdateTimelogData,
  ApproveTimelogData
} from "@/types/Timelog.model";

const TIMELOG_ENDPOINT = "/timelogs";

export interface TimelogFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  entityId?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  billable?: boolean;
  approved?: boolean;
}

export interface EmployeeReportRow {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface ReportTotals {
  totalHours: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface WeeklyApprovalSummary {
  employeeId: string;
  employeeName: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  draftCount: number;
  submittedCount: number;
  approvedCount: number;
  rejectedCount: number;
  weekStatus: "draft" | "submitted" | "approved" | "rejected";
  timelogs: Timelog[];
}

export interface BulkReviewWeekPayload {
  employeeId: string;
  weekStart: string;
  weekEnd: string;
  action: "approved" | "rejected";
  rejectionReason?: string;
}

export const timelogApi = {
  // Get all timelogs with optional filters
  getAll: async (params?: TimelogFilters) => {
    const { data } = await axiosClient.get<{
      data: Timelog[];
      total: number;
      page: number;
      limit: number;
    }>(TIMELOG_ENDPOINT, { params });
    return data;
  },

  // Get single timelog by ID
  getById: async (id: string) => {
    const { data } = await axiosClient.get<Timelog>(
      `${TIMELOG_ENDPOINT}/${id}`
    );
    return data;
  },

  // Get timelogs by employee ID
  getByEmployee: async (
    employeeId: string,
    params?: Omit<TimelogFilters, "employeeId">
  ) => {
    const { data } = await axiosClient.get<{
      data: Timelog[];
      total: number;
    }>(`${TIMELOG_ENDPOINT}/employee/${employeeId}`, { params });
    return data;
  },

  // Get timelogs by week (start and end date)
  getByWeek: async (
    startDate: string,
    endDate: string,
    params?: Omit<TimelogFilters, "startDate" | "endDate">
  ) => {
    const { data } = await axiosClient.get<{
      data: Timelog[];
      total: number;
      totalHours: number;
      billableHours: number;
    }>(TIMELOG_ENDPOINT, {
      params: {
        ...params,
        startDate,
        endDate
      }
    });
    return data;
  },

  // Get timelogs by employee and week
  getByEmployeeAndWeek: async (
    employeeId: string,
    startDate: string,
    endDate: string,
    params?: Omit<TimelogFilters, "employeeId" | "startDate" | "endDate">
  ) => {
    const { data } = await axiosClient.get<{
      data: Timelog[];
      total: number;
      totalHours: number;
      billableHours: number;
    }>(`${TIMELOG_ENDPOINT}/employee/${employeeId}`, {
      params: {
        ...params,
        startDate,
        endDate
      }
    });
    return data;
  },

  // Get timelogs by entity (project/company)
  getByEntity: async (
    entityId: string,
    params?: Omit<TimelogFilters, "entityId">
  ) => {
    const { data } = await axiosClient.get<{
      data: Timelog[];
      total: number;
    }>(`${TIMELOG_ENDPOINT}/entity/${entityId}`, { params });
    return data;
  },

  // Create new timelog
  create: async (timelogData: CreateTimelogData) => {
    const { data } = await axiosClient.post<Timelog>(
      TIMELOG_ENDPOINT,
      timelogData
    );
    return data;
  },

  // Update timelog
  update: async (id: string, timelogData: UpdateTimelogData) => {
    const { data } = await axiosClient.put<Timelog>(
      `${TIMELOG_ENDPOINT}/${id}`,
      timelogData
    );
    return data;
  },

  // Partially update timelog
  patch: async (id: string, timelogData: Partial<UpdateTimelogData>) => {
    const { data } = await axiosClient.patch<Timelog>(
      `${TIMELOG_ENDPOINT}/${id}`,
      timelogData
    );
    return data;
  },

  // Delete timelog
  delete: async (id: string) => {
    const { data } = await axiosClient.delete(`${TIMELOG_ENDPOINT}/${id}`);
    return data;
  },

  // Submit timelog for approval
  submit: async (id: string) => {
    const { data } = await axiosClient.post<Timelog>(
      `${TIMELOG_ENDPOINT}/${id}/submit`
    );
    return data;
  },

  // Approve timelog
  approve: async (id: string, approvalData?: ApproveTimelogData) => {
    const { data } = await axiosClient.post<Timelog>(
      `${TIMELOG_ENDPOINT}/${id}/approve`,
      approvalData
    );
    return data;
  },

  // Reject timelog
  reject: async (id: string, rejectionReason: string) => {
    const { data } = await axiosClient.post<Timelog>(
      `${TIMELOG_ENDPOINT}/${id}/reject`,
      { rejectionReason }
    );
    return data;
  },

  // Bulk submit timelogs
  bulkSubmit: async (timelogIds: string[]) => {
    const { data } = await axiosClient.post<{
      success: boolean;
      updated: number;
    }>(`${TIMELOG_ENDPOINT}/bulk/submit`, { timelogIds });
    return data;
  },

  // Bulk approve timelogs
  bulkApprove: async (
    timelogIds: string[],
    approvalData?: ApproveTimelogData
  ) => {
    const { data } = await axiosClient.post<{
      success: boolean;
      updated: number;
    }>(`${TIMELOG_ENDPOINT}/bulk/approve`, { timelogIds, ...approvalData });
    return data;
  },

  // Get timelog summary/statistics
  getSummary: async (params: {
    startDate: string;
    endDate: string;
    employeeId?: string;
  }) => {
    const { data } = await axiosClient.get<{
      success: boolean;
      data: EmployeeReportRow[];
      totals: ReportTotals;
    }>(`${TIMELOG_ENDPOINT}/summary`, { params });
    return data;
  },

  // Weekly approvals summary (manager/owner/admin)
  getWeeklyApprovals: async (params: {
    weekStart: string;
    weekEnd: string;
  }) => {
    const { data } = await axiosClient.get<{
      success: boolean;
      data: WeeklyApprovalSummary[];
    }>(`${TIMELOG_ENDPOINT}/weekly-approvals`, { params });
    return data;
  },

  // Bulk approve or reject all timelogs for an employee in a week
  bulkReviewWeek: async (payload: BulkReviewWeekPayload) => {
    const { data } = await axiosClient.post<{
      success: boolean;
      updated: number;
    }>(`${TIMELOG_ENDPOINT}/bulk/approve`, payload);
    return data;
  }
};
