import { axiosClient } from "./client";
import type {
  Owner,
  CreateOwnerPayload,
  UpdateOwnerPayload
} from "@/types/Owner.model";

export type {
  Owner,
  OwnerUser,
  CreateOwnerPayload,
  UpdateOwnerPayload
} from "@/types/Owner.model";

const unwrap = <T>(response: { data: { data: T } }): T => response.data.data;

export const ownerApi = {
  list: (): Promise<Owner[]> =>
    axiosClient.get<{ data: Owner[] }>("/owners").then(unwrap),

  get: (id: string): Promise<Owner> =>
    axiosClient.get<{ data: Owner }>(`/owners/${id}`).then(unwrap),

  create: (payload: CreateOwnerPayload): Promise<Owner> =>
    axiosClient.post<{ data: Owner }>("/owners", payload).then(unwrap),

  update: (id: string, payload: UpdateOwnerPayload): Promise<Owner> =>
    axiosClient.put<{ data: Owner }>(`/owners/${id}`, payload).then(unwrap),

  remove: (id: string): Promise<void> =>
    axiosClient.delete(`/owners/${id}`).then(() => undefined)
};
