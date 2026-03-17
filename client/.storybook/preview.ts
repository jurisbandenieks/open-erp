import type { Preview, Decorator } from "@storybook/react-vite";
import React from "react";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { theme } from "../src/theme";

const withMantine: Decorator = (Story) =>
  React.createElement(
    MantineProvider,
    { theme },
    React.createElement(
      DatesProvider,
      { settings: {} },
      React.createElement(Notifications),
      React.createElement(Story)
    )
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
