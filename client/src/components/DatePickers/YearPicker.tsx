import { useCallback } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import dayjs from "dayjs";

interface YearPickerProps {
  value: number;
  onChange: (year: number) => void;
  label?: string;
  minYear?: number;
  maxYear?: number;
}

export function YearPicker({
  value,
  onChange,
  label = "Year",
  minYear,
  maxYear
}: YearPickerProps) {
  const currentYear = dayjs().year();

  const goToPreviousYear = useCallback(() => {
    if (minYear === undefined || value > minYear) onChange(value - 1);
  }, [value, minYear, onChange]);

  const goToNextYear = useCallback(() => {
    if (maxYear === undefined || value < maxYear) onChange(value + 1);
  }, [value, maxYear, onChange]);

  const goToCurrentYear = useCallback(() => {
    onChange(currentYear);
  }, [currentYear, onChange]);

  const handleDateChange = useCallback(
    (dateString: string | null) => {
      if (dateString) onChange(dayjs(dateString).year());
    },
    [onChange]
  );

  const isCurrentYear = value === currentYear;

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Group gap="xs" wrap="nowrap" align="flex-end">
        <Button
          variant="default"
          size="sm"
          onClick={goToPreviousYear}
          leftSection={<IconChevronLeft size={14} />}
          px="sm"
          disabled={minYear !== undefined && value <= minYear}
        />

        <YearPickerInput
          value={new Date(value, 0, 1).toISOString()}
          onChange={handleDateChange}
          leftSection={<IconCalendar size={14} />}
          placeholder="Select year"
          size="sm"
          style={{ flex: 1 }}
          styles={{ input: { textAlign: "center" } }}
          minDate={minYear ? new Date(minYear, 0, 1) : undefined}
          maxDate={maxYear ? new Date(maxYear, 11, 31) : undefined}
        />

        <Button
          variant="default"
          size="sm"
          onClick={goToNextYear}
          rightSection={<IconChevronRight size={14} />}
          px="sm"
          disabled={maxYear !== undefined && value >= maxYear}
        />

        <Button
          variant={isCurrentYear ? "filled" : "light"}
          size="sm"
          onClick={goToCurrentYear}
          disabled={isCurrentYear}
        >
          This year
        </Button>
      </Group>
    </Stack>
  );
}

export default YearPicker;
