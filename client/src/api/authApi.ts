import axios from "axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload
} from "@/types/User.model";

export type { AuthResponse, LoginPayload, RegisterPayload };

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "/auth";

export const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const authApi = {
  register: async (payload: RegisterPayload): Promise<void> => {
    await authClient.post("/register", payload);
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await authClient.post<{
      success: boolean;
      data: AuthResponse;
    }>("/login", payload);
    return data.data;
  },

  logout: async (accessToken: string): Promise<void> => {
    await authClient.post(
      "/logout",
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  changePassword: async (
    accessToken: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await authClient.post(
      "/change-password",
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },

  refresh: async (
    refreshToken: string
  ): Promise<Pick<AuthResponse, "accessToken">> => {
    const { data } = await authClient.post<{
      success: boolean;
      data: Pick<AuthResponse, "accessToken">;
    }>("/refresh", { refreshToken });
    return data.data;
  }
};
