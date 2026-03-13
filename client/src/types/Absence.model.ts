export const AbsenceType = {
  VACATION: "vacation",
  SICK_LEAVE: "sick_leave",
  PERSONAL: "personal",
  UNPAID: "unpaid",
  MATERNITY: "maternity",
  PATERNITY: "paternity",
  BEREAVEMENT: "bereavement",
  STUDY: "study",
  TIME_IN_LIEU: "time_in_lieu"
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
  notes?: string | null;

  // Time in lieu link
  timeInLieuId?: string | null;

  // Approval workflow
  requestedAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;

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
  notes?: string;
  timeInLieuId?: string;
}

export interface UpdateAbsenceData {
  type?: AbsenceType;
  startDate?: string;
  endDate?: string;
  notes?: string;
  timeInLieuId?: string;
}

export interface ReviewAbsenceData {
  status: "approved" | "rejected";
  rejectionReason?: string;
}

export interface AbsenceFilters {
  employeeId?: string;
  type?: AbsenceType;
  status?: AbsenceStatus;
  year?: number;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  limit?: number;
}

export interface VacationBalance {
  employeeId: string;
  year: number;
  totalAllowed: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}
