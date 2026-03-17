import { TimelogType } from "@/types/Timelog.model";

export const TYPE_OPTIONS = [
  { value: TimelogType.STANDARD, label: "Standard" },
  { value: TimelogType.SICK, label: "Sick" },
  { value: TimelogType.HOLIDAY, label: "Holiday" },
  { value: TimelogType.OVERTIME, label: "Overtime" },
  { value: TimelogType.OTHER, label: "Other" }
];
