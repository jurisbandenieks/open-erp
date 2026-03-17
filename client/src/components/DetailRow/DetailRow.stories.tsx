import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Text } from "@mantine/core";
import { DetailRow } from "./DetailRow";

const meta: Meta<typeof DetailRow> = {
  title: "Components/DetailRow",
  component: DetailRow,
  argTypes: {
    label: { control: "text" },
    align: {
      control: "radio",
      options: ["center", "flex-start"]
    }
  }
};

export default meta;
type Story = StoryObj<typeof DetailRow>;

export const Default: Story = {
  args: {
    label: "Employee",
    children: <Text>John Smith</Text>
  }
};

export const WithBadge: Story = {
  args: {
    label: "Status",
    children: <Badge color="green">Approved</Badge>
  }
};

export const TopAligned: Story = {
  args: {
    label: "Notes",
    align: "flex-start",
    children: (
      <Text style={{ maxWidth: 260 }}>
        Employee requested additional days due to a family event. Approved by
        manager on short notice.
      </Text>
    )
  }
};

export const MultipleRows: Story = {
  render: () => (
    <div
      style={{ width: 400, display: "flex", flexDirection: "column", gap: 8 }}
    >
      <DetailRow label="Employee">
        <Text>Jane Doe</Text>
      </DetailRow>
      <DetailRow label="Type">
        <Text>Vacation</Text>
      </DetailRow>
      <DetailRow label="Date range">
        <Text>Mar 20 – Mar 24, 2026</Text>
      </DetailRow>
      <DetailRow label="Working days">
        <Text>5</Text>
      </DetailRow>
      <DetailRow label="Status">
        <Badge color="blue">Pending</Badge>
      </DetailRow>
    </div>
  )
};
