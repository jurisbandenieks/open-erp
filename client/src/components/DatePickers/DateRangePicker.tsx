import { useCallback } from "react";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function DateRangePicker({
  value,
  onChange,
  label,
  placeholder = "Pick date range",
  clearable = true,
  minDate,
  maxDate,
  size = "sm"
}: DateRangePickerProps) {
  const handleChange = useCallback(
    ([start, end]: [string | null, string | null]) => {
      onChange({
        startDate: start ? new Date(start) : null,
        endDate: end ? new Date(end) : null
      });
    },
    [onChange]
  );

  return (
    <DatePickerInput
      type="range"
      label={label}
      placeholder={placeholder}
      value={[
        value.startDate?.toISOString() ?? null,
        value.endDate?.toISOString() ?? null
      ]}
      onChange={handleChange}
      leftSection={<IconCalendar size={14} />}
      valueFormat="MMM DD, YYYY"
      size={size}
      clearable={clearable}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}

export default DateRangePicker;
