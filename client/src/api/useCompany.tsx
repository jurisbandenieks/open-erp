import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { companyApi, type CompanyOption } from "./companyApi";

export const companyKeys = {
  all: ["companies"] as const,
  list: () => [...companyKeys.all, "list"] as const
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
