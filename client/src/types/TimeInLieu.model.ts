export const TimeInLieuStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  USED: "used",
  EXPIRED: "expired",
  CANCELLED: "cancelled"
} as const;

export type TimeInLieuStatus =
  (typeof TimeInLieuStatus)[keyof typeof TimeInLieuStatus];

export interface TimeInLieu {
  id: string;

  // Belongs to employee
  employeeId: string;
  employeeName?: string;

  // Time details
  earnedDate: string;
  hours: number;
  reason: string;

  status: TimeInLieuStatus;

  // Usage tracking - assigned to absence when used
  usedDate?: string;
  absenceId?: string; // The absence this time in lieu was applied to
  absenceType?: string;
  hoursUsed?: number; // Partial usage support

  // Expiry
  expiryDate?: string;

  // Approval workflow
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Additional info
  notes?: string;
  companyId?: string; // Company where the extra time was worked
  companyName?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeInLieuData {
  employeeId: string;
  earnedDate: string;
  hours: number;
  reason: string;
  expiryDate?: string;
  notes?: string;
  companyId?: string;
}

export interface UpdateTimeInLieuData {
  earnedDate?: string;
  hours?: number;
  reason?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ApproveTimeInLieuData {
  timeInLieuId: string;
  approvedBy: string;
  approved: boolean;
  rejectionReason?: string;
}

export interface UseTimeInLieuData {
  timeInLieuId: string;
  absenceId: string;
  hoursUsed: number;
  usedDate: string;
}

export interface TimeInLieuFilters {
  employeeId?: string;
  status?: TimeInLieuStatus;
  companyId?: string;
  earnedDateFrom?: string;
  earnedDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  approvedBy?: string;
  search?: string;
}

// Helper interface for time in lieu balance
export interface TimeInLieuBalance {
  employeeId: string;
  employeeName: string;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
  totalPending: number;
  available: number;
  items: TimeInLieu[];
}
