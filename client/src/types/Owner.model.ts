export interface OwnerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

export interface Owner {
  id: string;
  userId: string;
  displayName: string;
  taxId: string;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  user: OwnerUser;
}

export interface CreateOwnerPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  taxId?: string;
  status?: string;
}

export interface CreateOwnerFromUserPayload {
  userId: string;
  displayName?: string;
  taxId?: string;
}

export interface UpdateOwnerPayload {
  userId?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  taxId?: string;
  status?: string;
}
