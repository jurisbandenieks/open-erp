import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions
} from "@tanstack/react-query";
import { companyApi } from "./companyApi";
import type { PaginatedResponse } from "@/types";
import type {
  Company,
  CompanyOption,
  CompanyListParams,
  CreateCompanyPayload,
  UpdateCompanyPayload
} from "@/types/Entity.model";

export const companyKeys = {
  all: ["companies"] as const,
  list: () => [...companyKeys.all, "list"] as const,
  mine: () => [...companyKeys.all, "mine"] as const,
  manage: () => [...companyKeys.all, "manage"] as const,
  manageList: (params?: CompanyListParams) =>
    [...companyKeys.manage(), "list", params] as const,
  detail: (id: string) => [...companyKeys.all, "detail", id] as const
};

export const useCompanies = (
  options?: Omit<UseQueryOptions<CompanyOption[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: () => companyApi.list(),
    ...options
  });
};

export const useMyCompanies = (
  options?: Omit<UseQueryOptions<CompanyOption[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: companyKeys.mine(),
    queryFn: () => companyApi.mine(),
    ...options
  });
};

export const useAllCompanies = (
  params?: CompanyListParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Company>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: companyKeys.manageList(params),
    queryFn: () => companyApi.getAll(params),
    ...options
  });
};

export const useCompany = (
  id: string,
  options?: Omit<UseQueryOptions<Company>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companyApi.getById(id),
    enabled: !!id,
    ...options
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companyApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.manage() });
      queryClient.invalidateQueries({ queryKey: companyKeys.mine() });
    }
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateCompanyPayload;
    }) => companyApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.manage() });
      queryClient.invalidateQueries({
        queryKey: companyKeys.detail(variables.id)
      });
      queryClient.invalidateQueries({ queryKey: companyKeys.mine() });
    }
  });
};
