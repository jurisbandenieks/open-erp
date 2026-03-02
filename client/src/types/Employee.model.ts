export const EmploymentStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
  TERMINATED: "terminated"
} as const;

export type EmploymentStatus =
  (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

export const AbsenceType = {
  VACATION: "vacation",
  SICK_LEAVE: "sick_leave",
  PERSONAL: "personal",
  UNPAID: "unpaid",
  MATERNITY: "maternity",
  PATERNITY: "paternity"
} as const;

export type AbsenceType = (typeof AbsenceType)[keyof typeof AbsenceType];

export const AbsenceStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled"
} as const;

export type AbsenceStatus = (typeof AbsenceStatus)[keyof typeof AbsenceStatus];

export const TimeInLieuStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  USED: "used",
  EXPIRED: "expired"
} as const;

export type TimeInLieuStatus =
  (typeof TimeInLieuStatus)[keyof typeof TimeInLieuStatus];

export interface Manager {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
}

export interface Timelog {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakDuration: number; // minutes
  totalHours: number;
  notes?: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  type: AbsenceType;
  status: AbsenceStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  notes?: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeInLieu {
  id: string;
  employeeId: string;
  earnedDate: string;
  hours: number;
  reason: string;
  status: TimeInLieuStatus;
  usedDate?: string;
  expiryDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  userId?: string; // Link to User account if applicable
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

  // Relations
  managers: Manager[];
  timelogs: Timelog[];
  absences: Absence[];
  timeInLieus: TimeInLieu[];

  // Additional info
  salary?: number;
  contractType?: string; // 'full-time', 'part-time', 'contract'
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
