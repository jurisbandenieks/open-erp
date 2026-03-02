import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Navigation } from "@/components/Navigation/Navigation";
import { Header } from "@/components/Header/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
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

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default Layout;
