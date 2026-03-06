import { axiosClient } from "./client";

export interface CompanyOption {
  id: string;
  name: string;
}

export const companyApi = {
  list: (): Promise<CompanyOption[]> =>
    axiosClient
      .get<{ data: CompanyOption[] }>("/companies")
      .then((res) => res.data.data)
};
