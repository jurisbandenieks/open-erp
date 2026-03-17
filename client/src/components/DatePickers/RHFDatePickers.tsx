import {
  Controller,
  type Control,
  type FieldValues,
  type Path
} from "react-hook-form";
import { Text } from "@mantine/core";
import { WeekPicker } from "./WeekPicker";
import { YearPicker } from "./YearPicker";
import { DateRangePicker, type DateRange } from "./DateRangePicker";

// ─── RHF WeekPicker ──────────────────────────────────────────────────────────

interface RHFWeekPickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
}

export function RHFWeekPicker<T extends FieldValues>({
  name,
  control,
  label
}: RHFWeekPickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <WeekPicker
            weekStart={field.value ?? new Date()}
            onChange={field.onChange}
            label={label}
          />
          {fieldState.error && (
            <Text size="xs" c="red">
              {fieldState.error.message}
            </Text>
          )}
        </>
      )}
    />
  );
}

// ─── RHF YearPicker ──────────────────────────────────────────────────────────

interface RHFYearPickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  minYear?: number;
  maxYear?: number;
}

export function RHFYearPicker<T extends FieldValues>({
  name,
  control,
  label,
  minYear,
  maxYear
}: RHFYearPickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <YearPicker
            value={field.value ?? new Date().getFullYear()}
            onChange={field.onChange}
            label={label}
            minYear={minYear}
            maxYear={maxYear}
          />
          {fieldState.error && (
            <Text size="xs" c="red">
              {fieldState.error.message}
            </Text>
          )}
        </>
      )}
    />
  );
}

// ─── RHF DateRangePicker ─────────────────────────────────────────────────────

interface RHFDateRangePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function RHFDateRangePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  clearable,
  minDate,
  maxDate
}: RHFDateRangePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <DateRangePicker
            value={
              (field.value as DateRange) ?? { startDate: null, endDate: null }
            }
            onChange={field.onChange}
            label={label}
            placeholder={placeholder}
            clearable={clearable}
            minDate={minDate}
            maxDate={maxDate}
          />
          {fieldState.error && (
            <Text size="xs" c="red">
              {fieldState.error.message}
            </Text>
          )}
        </>
      )}
    />
  );
}
