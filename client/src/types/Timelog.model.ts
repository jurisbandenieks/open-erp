export const TimelogStatus = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected"
} as const;

export type TimelogStatus = (typeof TimelogStatus)[keyof typeof TimelogStatus];

export const TimelogType = {
  STANDARD: "standard",
  OVERTIME: "overtime",
  HOLIDAY: "holiday",
  SICK: "sick",
  OTHER: "other"
} as const;

export type TimelogType = (typeof TimelogType)[keyof typeof TimelogType];

export interface Timelog {
  id: string;
  employeeId: string;
  employeeName?: string;
  entityId?: string; // Project/Company the work was done for
  entityName?: string;

  date: string;
  totalHours: number;

  type: TimelogType;
  status: TimelogStatus;

  // Work details
  description?: string;
  notes?: string;
  taskIds?: string[]; // Related tasks if applicable

  // Location
  location?: string;
  isRemote?: boolean;

  // Approval workflow
  approved: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Billing
  billable?: boolean;
  billableHours?: number;
  hourlyRate?: number;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTimelogData {
  employeeId: string;
  entityId?: string;
  date: string;
  totalHours: number;
  type?: TimelogType;
  description?: string;
  notes?: string;
  location?: string;
  isRemote?: boolean;
  billable?: boolean;
  taskIds?: string[];
}

export interface UpdateTimelogData {
  date?: string;
  type?: TimelogType;
  status?: TimelogStatus;
  totalHours?: number;
  description?: string;
  notes?: string;
  location?: string;
  isRemote?: boolean;
  billable?: boolean;
  billableHours?: number;
  taskIds?: string[];
}

export interface ApproveTimelogData {
  timelogId: string;
  approvedBy: string;
  approved: boolean;
  rejectionReason?: string;
}

export interface TimelogFilters {
  employeeId?: string;
  entityId?: string;
  type?: TimelogType;
  status?: TimelogStatus;
  dateFrom?: string;
  dateTo?: string;
  approved?: boolean;
  approvedBy?: string;
  billable?: boolean;
  isRemote?: boolean;
  search?: string;
}

// Helper interfaces for timesheet reports
export interface TimelogSummary {
  employeeId: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  billableHours: number;
  totalEarnings?: number;
  timelogs: Timelog[];
}

export interface WeeklyTimesheet {
  weekStart: string;
  weekEnd: string;
  employeeId: string;
  employeeName: string;
  dailyLogs: {
    date: string;
    timelogs: Timelog[];
    totalHours: number;
  }[];
  weekTotal: number;
}
