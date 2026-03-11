export type WeekRow = {
  dayLabel: string;
  date: string;
  existingId: string | null;
  hours: number | string;
  type: string;
  notes: string;
  status: string | null;
  isDirty: boolean;
  isSaving: boolean;
};
