import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";

import AppRoutes from "./Routes";
import { theme } from "./theme";

import "@mantine/core/styles.css";
// ‼️ import notifications styles after core package styles
import "@mantine/notifications/styles.css";
// ‼️ import dates styles after core package styles
import "@mantine/dates/styles.css";

import { Notifications } from "@mantine/notifications";

const modules = [AllCommunityModule];

function App() {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <AgGridProvider modules={modules}>
          <AppRoutes />
        </AgGridProvider>
        <Notifications />
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
