import { AbsenceStatus, AbsenceType } from "@/types/Absence.model";
import { TimelogType } from "@/types/Timelog.model";

export const STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  submitted: "blue",
  approved: "green",
  rejected: "red"
};

// ── User ──────────────────────────────────────────────────────────────────────

export const USER_ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" }
];

export const USER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" }
];

// ── Owner / Company ───────────────────────────────────────────────────────────

export const COMPANY_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" }
];

// ── Employee ──────────────────────────────────────────────────────────────────

export const CONTRACT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
  { value: "freelance", label: "Freelance" }
];

// ── Timelog ───────────────────────────────────────────────────────────────────

export const TIMELOG_TYPE_OPTIONS = [
  { value: TimelogType.STANDARD, label: "Standard" },
  { value: TimelogType.SICK, label: "Sick" },
  { value: TimelogType.HOLIDAY, label: "Holiday" },
  { value: TimelogType.OVERTIME, label: "Overtime" },
  { value: TimelogType.OTHER, label: "Other" }
];

// ── Absence ───────────────────────────────────────────────────────────────────

export const ABSENCE_TYPE_OPTIONS = [
  { value: AbsenceType.VACATION, label: "Vacation" },
  { value: AbsenceType.SICK_LEAVE, label: "Sick Leave" },
  { value: AbsenceType.PERSONAL, label: "Personal" },
  { value: AbsenceType.UNPAID, label: "Unpaid" },
  { value: AbsenceType.MATERNITY, label: "Maternity" },
  { value: AbsenceType.PATERNITY, label: "Paternity" },
  { value: AbsenceType.BEREAVEMENT, label: "Bereavement" },
  { value: AbsenceType.STUDY, label: "Study" },
  { value: AbsenceType.TIME_IN_LIEU, label: "Time in Lieu" }
];

export const ABSENCE_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: AbsenceStatus.PENDING, label: "Pending" },
  { value: AbsenceStatus.APPROVED, label: "Approved" },
  { value: AbsenceStatus.REJECTED, label: "Rejected" },
  { value: AbsenceStatus.CANCELLED, label: "Cancelled" }
];
