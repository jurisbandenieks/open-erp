export const AbsenceType = {
  VACATION: "vacation",
  SICK_LEAVE: "sick_leave",
  PERSONAL: "personal",
  UNPAID: "unpaid",
  MATERNITY: "maternity",
  PATERNITY: "paternity",
  BEREAVEMENT: "bereavement",
  STUDY: "study"
} as const;

export type AbsenceType = (typeof AbsenceType)[keyof typeof AbsenceType];

export const AbsenceStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled"
} as const;

export type AbsenceStatus = (typeof AbsenceStatus)[keyof typeof AbsenceStatus];

export interface Absence {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: AbsenceType;
  status: AbsenceStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  notes?: string;

  // Approval workflow
  requestedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;

  // Documents
  attachments?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateAbsenceData {
  employeeId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  reason?: string;
  notes?: string;
  attachments?: string[];
}

export interface UpdateAbsenceData {
  type?: AbsenceType;
  startDate?: string;
  endDate?: string;
  reason?: string;
  notes?: string;
  attachments?: string[];
}

export interface ReviewAbsenceData {
  absenceId: string;
  status: "approved" | "rejected";
  reviewedBy: string;
  rejectionReason?: string;
}

export interface AbsenceFilters {
  employeeId?: string;
  type?: AbsenceType;
  status?: AbsenceStatus;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  reviewedBy?: string;
  search?: string;
}

// Helper interface for absence balance/quota
export interface AbsenceBalance {
  employeeId: string;
  employeeName: string;
  type: AbsenceType;
  totalAllowed: number;
  used: number;
  pending: number;
  remaining: number;
  year: number;
}
