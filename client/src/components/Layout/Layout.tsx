import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Navigation } from "@/components/Navigation/Navigation";
import { Header } from "@/components/Header/Header";
import { Outlet } from "react-router";

export function Layout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <Header opened={opened} onToggle={toggle} />

      <AppShell.Navbar p="md">
        <Navigation onNavigate={toggle} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
