import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateRangePicker, type DateRange } from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
  title: "Components/DatePickers/DateRangePicker",
  component: DateRangePicker,
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    clearable: { control: "boolean" },
    size: {
      control: "radio",
      options: ["xs", "sm", "md", "lg", "xl"]
    }
  }
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

function Controlled(args: Partial<Parameters<typeof DateRangePicker>[0]>) {
  const [range, setRange] = useState<DateRange>({
    startDate: null,
    endDate: null
  });
  return <DateRangePicker {...args} value={range} onChange={setRange} />;
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    label: "Date range",
    placeholder: "Pick date range",
    clearable: true,
    size: "sm"
  }
};

export const WithInitialValue: Story = {
  render: (args) => {
    const [range, setRange] = useState<DateRange>({
      startDate: new Date("2026-03-10"),
      endDate: new Date("2026-03-20")
    });
    return <DateRangePicker {...args} value={range} onChange={setRange} />;
  },
  args: {
    label: "Date range",
    clearable: true,
    size: "sm"
  }
};

export const Large: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    label: "Select period",
    size: "lg"
  }
};

export const NotClearable: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    label: "Locked range",
    clearable: false,
    size: "sm"
  }
};
