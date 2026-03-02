import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import AppRoutes from "./Routes";

import "@mantine/core/styles.css";
// ‼️ import notifications styles after core package styles
import "@mantine/notifications/styles.css";
// ‼️ import dates styles after core package styles
import "@mantine/dates/styles.css";

import { Notifications } from "@mantine/notifications";

function App() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <AppRoutes />

        <Notifications />
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
