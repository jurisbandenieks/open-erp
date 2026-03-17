export const CompanyStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended"
} as const;

export type CompanyStatus = (typeof CompanyStatus)[keyof typeof CompanyStatus];

// ─── Company ─────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  vatNumber?: string;
  status: CompanyStatus;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  currency?: string;
  foundedAt?: string;
  ownerId: string;
  ownerName?: string; // populated by server join
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  registrationNumber: string;
  vatNumber?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  foundedAt?: string;
  ownerId: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  vatNumber?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  status?: CompanyStatus;
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// ─── Generic entity (projects, engagements, etc.) ────────────────────────────
