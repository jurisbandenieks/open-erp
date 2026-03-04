import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";

import AppRoutes from "./Routes";
import { theme } from "./theme";

import "@mantine/core/styles.css";
// ‼️ import notifications styles after core package styles
import "@mantine/notifications/styles.css";
// ‼️ import dates styles after core package styles
import "@mantine/dates/styles.css";

const modules = [AllCommunityModule];

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <AgGridProvider modules={modules}>
            <AppRoutes />
          </AgGridProvider>
          <Notifications />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
