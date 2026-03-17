import { AbsenceStatus } from "@/types/Absence.model";

export const STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  submitted: "blue",
  approved: "green",
  rejected: "red"
};

export const ABSENCE_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: AbsenceStatus.PENDING, label: "Pending" },
  { value: AbsenceStatus.APPROVED, label: "Approved" },
  { value: AbsenceStatus.REJECTED, label: "Rejected" },
  { value: AbsenceStatus.CANCELLED, label: "Cancelled" }
];

export const COMPANY_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" }
];
