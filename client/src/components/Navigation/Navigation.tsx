import { AppShell, NavLink } from "@mantine/core";
import {
  IconHome,
  IconUsers,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconFileText,
  IconChevronRight
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router";
import { Footer } from "@/components/Footer/Footer";

interface NavigationProps {
  onNavigate?: () => void;
}

const menuItems = [
  { icon: IconHome, label: "Dashboard", path: "/" },
  { icon: IconUsers, label: "Employees", path: "/employees" },
  { icon: IconBuilding, label: "Entities", path: "/entities" },
  { icon: IconCalendar, label: "Absences", path: "/absences" },
  { icon: IconClock, label: "Timelogs", path: "/timelogs" },
  { icon: IconFileText, label: "Reports", path: "/reports" }
];

export function Navigation({ onNavigate }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <>
      <AppShell.Section grow>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            active={location.pathname === item.path}
            label={item.label}
            leftSection={<item.icon size="1rem" stroke={1.5} />}
            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
            onClick={() => handleNavigate(item.path)}
            mb="xs"
          />
        ))}
      </AppShell.Section>

      <Footer />
    </>
  );
}

export default Navigation;
