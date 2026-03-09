import { type Manager } from "./Manager.model";
import { type Absence, AbsenceType } from "./Absence.model";
import { type Timelog } from "./Timelog.model";
import { type TimeInLieu } from "./TimeInLieu.model";
export const EmploymentStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
  TERMINATED: "terminated"
} as const;

export type EmploymentStatus =
  (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

export interface Employee {
  id: string;
  userId?: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  hireDate: string;
  terminationDate?: string;
  position: string;
  department: string;
  status: EmploymentStatus;
  companyId?: string;

  // Manager/managee IDs for relation management
  managerIds: string[];
  manageeIds: string[];

  // Manager/managee display names for tooltips
  managerNames: string[];
  manageeNames: string[];

  // Relations
  managers: Manager[];
  timelogs: Timelog[];
  absences: Absence[];
  timeInLieus: TimeInLieu[];

  // Additional info
  salary?: number;
  contractType?: string;
  workingHoursPerWeek?: number;
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  hireDate: string;
  position: string;
  department: string;
  companyId: string;
  managerIds?: string[];
  salary?: number;
  contractType?: string;
  workingHoursPerWeek?: number;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  status?: EmploymentStatus;
  managerIds?: string[];
  salary?: number;
  contractType?: string;
  workingHoursPerWeek?: number;
}

export interface CreateTimelogData {
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakDuration?: number;
  notes?: string;
}

export interface CreateAbsenceData {
  employeeId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  reason?: string;
  notes?: string;
}

export interface CreateTimeInLieuData {
  employeeId: string;
  earnedDate: string;
  hours: number;
  reason: string;
}
