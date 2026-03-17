import type { Preview, Decorator } from "@storybook/react-vite";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { theme } from "../src/theme";

ModuleRegistry.registerModules([AllCommunityModule]);

const withMantine: Decorator = (Story) => (
  <MantineProvider theme={theme}>
    <DatesProvider settings={{}}>
      <Notifications />
      <Story />
    </DatesProvider>
  </MantineProvider>
);

const preview: Preview = {
  decorators: [withMantine],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    layout: "padded"
  }
};

export default preview;
