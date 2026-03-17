import { axiosClient } from "./client";
import type {
  Company,
  CreateCompanyPayload,
  UpdateCompanyPayload
} from "@/types/Entity.model";
import type { PaginatedResponse } from "@/types";

export interface CompanyOption {
  id: string;
  name: string;
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export type CompanyListResponse = PaginatedResponse<Company>;

const MANAGE_ENDPOINT = "/companies/manage";

export const companyApi = {
  list: (): Promise<CompanyOption[]> =>
    axiosClient
      .get<{ data: CompanyOption[] }>("/companies")
      .then((res) => res.data.data),

  mine: (): Promise<CompanyOption[]> =>
    axiosClient
      .get<{ data: CompanyOption[] }>("/companies/mine")
      .then((res) => res.data.data),

  getAll: async (params?: CompanyListParams): Promise<CompanyListResponse> => {
    const { data } = await axiosClient.get<CompanyListResponse>(
      MANAGE_ENDPOINT,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Company> => {
    const { data } = await axiosClient.get<Company>(`${MANAGE_ENDPOINT}/${id}`);
    return data;
  },

  create: async (payload: CreateCompanyPayload): Promise<Company> => {
    const { data } = await axiosClient.post<Company>(MANAGE_ENDPOINT, payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateCompanyPayload
  ): Promise<Company> => {
    const { data } = await axiosClient.put<Company>(
      `${MANAGE_ENDPOINT}/${id}`,
      payload
    );
    return data;
  }
};
