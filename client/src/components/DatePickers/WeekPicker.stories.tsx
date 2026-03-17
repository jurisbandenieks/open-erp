import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { WeekPicker } from "./WeekPicker";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const meta: Meta<typeof WeekPicker> = {
  title: "Components/DatePickers/WeekPicker",
  component: WeekPicker,
  argTypes: {
    label: { control: "text" }
  }
};

export default meta;
type Story = StoryObj<typeof WeekPicker>;

function Controlled(args: Partial<Parameters<typeof WeekPicker>[0]>) {
  const [weekStart, setWeekStart] = useState(
    dayjs().startOf("isoWeek").toDate()
  );
  return <WeekPicker {...args} weekStart={weekStart} onChange={setWeekStart} />;
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Week Range" }
};

export const CustomLabel: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Select approval week" }
};

export const PastWeek: Story = {
  render: (args) => {
    const [weekStart, setWeekStart] = useState(
      dayjs().subtract(1, "week").startOf("isoWeek").toDate()
    );
    return (
      <WeekPicker {...args} weekStart={weekStart} onChange={setWeekStart} />
    );
  }
};
