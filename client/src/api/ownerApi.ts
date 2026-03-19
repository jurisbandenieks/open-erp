import { axiosClient } from "./client";
import type {
  Owner,
  CreateOwnerPayload,
  CreateOwnerFromUserPayload,
  UpdateOwnerPayload
} from "@/types/Owner.model";

export type {
  Owner,
  OwnerUser,
  CreateOwnerPayload,
  CreateOwnerFromUserPayload,
  UpdateOwnerPayload
} from "@/types/Owner.model";

const OWNER_ENDPOINT = "/owners";

export const ownerApi = {
  list: async (): Promise<Owner[]> => {
    const { data } = await axiosClient.get<{ data: Owner[] }>(OWNER_ENDPOINT);
    return data.data;
  },

  get: async (id: string): Promise<Owner> => {
    const { data } = await axiosClient.get<{ data: Owner }>(
      `${OWNER_ENDPOINT}/${id}`
    );
    return data.data;
  },

  create: async (payload: CreateOwnerPayload): Promise<Owner> => {
    const { data } = await axiosClient.post<{ data: Owner }>(
      OWNER_ENDPOINT,
      payload
    );
    return data.data;
  },

  createFromUser: async (
    payload: CreateOwnerFromUserPayload
  ): Promise<Owner> => {
    const { data } = await axiosClient.post<{ data: Owner }>(
      `${OWNER_ENDPOINT}/from-user`,
      payload
    );
    return data.data;
  },

  update: async (id: string, payload: UpdateOwnerPayload): Promise<Owner> => {
    const { data } = await axiosClient.put<{ data: Owner }>(
      `${OWNER_ENDPOINT}/${id}`,
      payload
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`${OWNER_ENDPOINT}/${id}`);
  },

  me: async (): Promise<Owner | null> => {
    try {
      const { data } = await axiosClient.get<{ data: Owner }>(
        `${OWNER_ENDPOINT}/me`
      );
      return data.data;
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404)
        return null;
      throw err;
    }
  }
};
