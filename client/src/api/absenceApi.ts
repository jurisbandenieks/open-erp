import { axiosClient } from "./client";
import type { PaginatedResponse } from "@/types";
import type {
  Absence,
  AbsenceFilters,
  CreateAbsenceData,
  UpdateAbsenceData,
  ReviewAbsenceData,
  VacationBalance
} from "@/types/Absence.model";

const ABSENCE_ENDPOINT = "/absences";

export const absenceApi = {
  getAll: async (params?: AbsenceFilters) => {
    const { data } = await axiosClient.get<PaginatedResponse<Absence>>(
      ABSENCE_ENDPOINT,
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosClient.get<{ success: boolean; data: Absence }>(
      `${ABSENCE_ENDPOINT}/${id}`
    );
    return data.data;
  },

  getByEmployee: async (
    employeeId: string,
    params?: { year?: number; status?: string }
  ) => {
    const { data } = await axiosClient.get<{
      success: boolean;
      data: Absence[];
    }>(`${ABSENCE_ENDPOINT}/employee/${employeeId}`, { params });
    return data.data;
  },

  create: async (payload: CreateAbsenceData) => {
    const { data } = await axiosClient.post<{
      success: boolean;
      data: Absence;
    }>(ABSENCE_ENDPOINT, payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateAbsenceData) => {
    const { data } = await axiosClient.put<{ success: boolean; data: Absence }>(
      `${ABSENCE_ENDPOINT}/${id}`,
      payload
    );
    return data.data;
  },

  delete: async (id: string) => {
    await axiosClient.delete(`${ABSENCE_ENDPOINT}/${id}`);
  },

  review: async (id: string, payload: ReviewAbsenceData) => {
    const { data } = await axiosClient.post<{
      success: boolean;
      data: Absence;
    }>(`${ABSENCE_ENDPOINT}/${id}/review`, payload);
    return data.data;
  },

  getVacationBalance: async (employeeId: string, year?: number) => {
    const { data } = await axiosClient.get<{
      success: boolean;
      data: VacationBalance;
    }>(`${ABSENCE_ENDPOINT}/employee/${employeeId}/balance`, {
      params: year ? { year } : undefined
    });
    return data.data;
  }
};
