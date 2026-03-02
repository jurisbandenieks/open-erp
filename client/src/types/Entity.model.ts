import { type EntityManager } from "./Manager.model";

export const EntityType = {
  COMPANY: "company",
  PROJECT: "project",
  ENGAGEMENT: "engagement",
  DEPARTMENT: "department",
  DIVISION: "division"
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const EntityStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  COMPLETED: "completed",
  ON_HOLD: "on_hold",
  CANCELLED: "cancelled"
} as const;

export type EntityStatus = (typeof EntityStatus)[keyof typeof EntityStatus];

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  description?: string;
  code?: string; // Unique identifier/code for the entity

  // Relations
  managers: EntityManager[];
  parentEntityId?: string; // For hierarchical structures
  childEntities?: Entity[];

  // Dates
  startDate?: string;
  endDate?: string;

  // Financial
  budget?: number;
  currency?: string;

  // Contact & Location
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;

  // Additional metadata
  tags?: string[];
  customFields?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateEntityData {
  name: string;
  type: EntityType;
  description?: string;
  code?: string;
  parentEntityId?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  tags?: string[];
  managerIds?: string[];
}

export interface UpdateEntityData {
  name?: string;
  status?: EntityStatus;
  description?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  tags?: string[];
}

export interface EntityFilters {
  type?: EntityType;
  status?: EntityStatus;
  managerId?: string;
  parentEntityId?: string;
  search?: string;
  tags?: string[];
}
