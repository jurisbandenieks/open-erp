import { AppShell, NavLink } from "@mantine/core";
import {
  IconHome,
  IconUsers,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconFileText,
  IconChevronRight,
  IconBuildingSkyscraper
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router";
import { Footer } from "@/components/Footer/Footer";
import { useAuth } from "@/context/AuthContext";

interface NavigationProps {
  onNavigate?: () => void;
}

const menuItems = [
  { icon: IconHome, label: "Dashboard", path: "/", roles: null },
  {
    icon: IconUsers,
    label: "Employees",
    path: "/admin/employees",
    roles: null
  },
  {
    icon: IconBuilding,
    label: "Companies",
    path: "/admin/companies",
    roles: null
  },
  { icon: IconCalendar, label: "Absences", path: "/absences", roles: null },
  { icon: IconClock, label: "Timelogs", path: "/timelogs", roles: null },
  { icon: IconFileText, label: "Reports", path: "/admin/reports", roles: null },
  {
    icon: IconBuildingSkyscraper,
    label: "Owners",
    path: "/owners",
    roles: ["admin"]
  },
  {
    icon: IconUsers,
    label: "Users",
    path: "/users",
    roles: ["admin"]
  }
];

export function Navigation({ onNavigate }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? "")
  );

  return (
    <>
      <AppShell.Section grow>
        {visibleItems.map((item) => (
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
