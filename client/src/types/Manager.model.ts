export const ManagerRole = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  TECHNICAL_LEAD: "technical_lead",
  ACCOUNT_MANAGER: "account_manager",
  PROJECT_MANAGER: "project_manager"
} as const;

export type ManagerRole = (typeof ManagerRole)[keyof typeof ManagerRole];

export interface Manager {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  phoneNumber?: string;
  position?: string;
  avatar?: string;
}

export interface CompanyManager {
  id: string;
  companyId: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
  role: ManagerRole;
  assignedAt: string;
  assignedBy?: string;
}

export interface AssignManagerData {
  companyId: string;
  managerId: string;
  role: ManagerRole;
}
