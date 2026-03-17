import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell } from "@mantine/core";
import { Footer } from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  decorators: [
    (Story) => (
      <AppShell>
        <Story />
      </AppShell>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
