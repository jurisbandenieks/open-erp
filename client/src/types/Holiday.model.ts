export const HolidayType = {
  PUBLIC: "public",
  NATIONAL: "national",
  RELIGIOUS: "religious",
  COMPANY: "company",
  REGIONAL: "regional"
} as const;

export type HolidayType = (typeof HolidayType)[keyof typeof HolidayType];

export interface Holiday {
  id: string;
  name: string;
  type: HolidayType;
  date: string;
  endDate?: string; // For multi-day holidays
  description?: string;

  // Location/Scope
  country?: string;
  region?: string;
  companyId?: string; // Specific entities this holiday applies to

  // Recurring
  isRecurring: boolean;
  recurrencePattern?: string; // e.g., 'yearly', 'monthly'

  // Observance
  isObserved: boolean; // Whether work is off
  isPaid: boolean; // Whether it's a paid holiday

  // Additional info
  notes?: string;
  customFields?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateHolidayData {
  name: string;
  type: HolidayType;
  date: string;
  endDate?: string;
  description?: string;
  country?: string;
  region?: string;
  companyId?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  isObserved?: boolean;
  isPaid?: boolean;
  notes?: string;
}

export interface UpdateHolidayData {
  name?: string;
  type?: HolidayType;
  date?: string;
  endDate?: string;
  description?: string;
  country?: string;
  region?: string;
  companyId?: string[];
  isRecurring?: boolean;
  recurrencePattern?: string;
  isObserved?: boolean;
  isPaid?: boolean;
  notes?: string;
}

export interface HolidayFilters {
  type?: HolidayType;
  country?: string;
  region?: string;
  companyId?: string;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  isObserved?: boolean;
  isPaid?: boolean;
  search?: string;
}

// Helper interface for calendar view
export interface HolidayCalendar {
  year: number;
  holidays: Holiday[];
  totalObservedDays: number;
  totalPaidDays: number;
}
