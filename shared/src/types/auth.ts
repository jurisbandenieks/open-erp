/** Shape returned by POST /validate and cached in Redis by the api service. */
export interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}
