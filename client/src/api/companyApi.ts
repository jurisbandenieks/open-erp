import { axiosClient } from "./client";
import type {
  Company,
  CompanyOption,
  CompanyListParams,
  CreateCompanyPayload,
  UpdateCompanyPayload
} from "@/types/Company.model";
import type { PaginatedResponse } from "@/types";

const MANAGE_ENDPOINT = "/companies/manage";

export const companyApi = {
  list: async (): Promise<CompanyOption[]> => {
    const { data } = await axiosClient.get<{ data: CompanyOption[] }>(
      "/companies"
    );
    return data.data;
  },

  mine: async (): Promise<CompanyOption[]> => {
    const { data } = await axiosClient.get<{ data: CompanyOption[] }>(
      "/companies/mine"
    );
    return data.data;
  },

  getAll: async (
    params?: CompanyListParams
  ): Promise<PaginatedResponse<Company>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Company>>(
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
