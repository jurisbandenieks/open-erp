import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { YearPicker } from "./YearPicker";
import dayjs from "dayjs";

const meta: Meta<typeof YearPicker> = {
  title: "Components/DatePickers/YearPicker",
  component: YearPicker,
  argTypes: {
    label: { control: "text" },
    minYear: { control: "number" },
    maxYear: { control: "number" }
  }
};

export default meta;
type Story = StoryObj<typeof YearPicker>;

function Controlled(args: Partial<Parameters<typeof YearPicker>[0]>) {
  const [year, setYear] = useState(dayjs().year());
  return <YearPicker {...args} value={year} onChange={setYear} />;
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Year" }
};

export const WithBounds: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    label: "Year (2020 – 2030)",
    minYear: 2020,
    maxYear: 2030
  }
};

export const CustomLabel: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Report year" }
};
