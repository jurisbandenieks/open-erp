import { useCallback } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export interface WeekRange {
  weekStart: Date;
  weekEnd: Date;
}

interface WeekPickerProps {
  weekStart: Date;
  onChange: (weekStart: Date) => void;
  label?: string;
}

export function WeekPicker({
  weekStart,
  onChange,
  label = "Week Range"
}: WeekPickerProps) {
  const weekEnd = dayjs(weekStart).endOf("isoWeek").toDate();

  const goToPreviousWeek = useCallback(() => {
    onChange(dayjs(weekStart).subtract(1, "week").toDate());
  }, [weekStart, onChange]);

  const goToNextWeek = useCallback(() => {
    onChange(dayjs(weekStart).add(1, "week").toDate());
  }, [weekStart, onChange]);

  const goToCurrentWeek = useCallback(() => {
    onChange(dayjs().startOf("isoWeek").toDate());
  }, [onChange]);

  const handleDateChange = useCallback(
    (date: Date | null) => {
      if (date) onChange(dayjs(date).startOf("isoWeek").toDate());
    },
    [onChange]
  );

  const isCurrentWeek = dayjs(weekStart).isSame(
    dayjs().startOf("isoWeek"),
    "day"
  );

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Group gap="xs" wrap="nowrap" align="flex-end">
        <Button
          variant="default"
          size="sm"
          onClick={goToPreviousWeek}
          leftSection={<IconChevronLeft size={14} />}
          px="sm"
        />

        <DatePickerInput
          value={weekStart}
          onChange={(dateString) =>
            handleDateChange(new Date(dateString ?? ""))
          }
          leftSection={<IconCalendar size={14} />}
          placeholder="Select week"
          valueFormat="MMM DD, YYYY"
          size="sm"
          style={{ flex: 1 }}
          styles={{
            input: { textAlign: "center" }
          }}
        />

        <Button
          variant="default"
          size="sm"
          onClick={goToNextWeek}
          rightSection={<IconChevronRight size={14} />}
          px="sm"
        />

        <Button
          variant={isCurrentWeek ? "filled" : "light"}
          size="sm"
          onClick={goToCurrentWeek}
          disabled={isCurrentWeek}
        >
          Today
        </Button>
      </Group>

      <Text size="xs" c="dimmed">
        {dayjs(weekStart).format("MMM DD")} –{" "}
        {dayjs(weekEnd).format("MMM DD, YYYY")}
        {isCurrentWeek && (
          <Text component="span" c="blue" fw={500}>
            {" "}
            (Current week)
          </Text>
        )}
      </Text>
    </Stack>
  );
}

export default WeekPicker;
