import axios from "axios";
import { axiosClient } from "./client";

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "/auth";

export const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<void> => {
    await axiosClient.post("/v1/users", payload);
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await authClient.post<AuthResponse>("/login", payload);
    return data;
  },

  logout: async (accessToken: string): Promise<void> => {
    await authClient.post(
      "/logout",
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  refresh: async (
    refreshToken: string
  ): Promise<Pick<AuthResponse, "accessToken">> => {
    const { data } = await authClient.post<Pick<AuthResponse, "accessToken">>(
      "/refresh",
      { refreshToken }
    );
    return data;
  }
};
