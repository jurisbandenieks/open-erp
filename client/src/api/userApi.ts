import { axiosClient } from "./client";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ListUsersResponse
} from "@/types/User.model";

export const userApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<ListUsersResponse> => {
    const res = await axiosClient.get("/users", { params });
    return res.data;
  },

  get: async (id: string): Promise<User> => {
    const res = await axiosClient.get(`/users/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const res = await axiosClient.post("/users", payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const res = await axiosClient.put(`/users/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  }
};
