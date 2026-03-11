import { AppShell, NavLink, Text, Divider, Stack } from "@mantine/core";
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

type MenuItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[] | null;
};

const employeeItems: MenuItem[] = [
  { icon: IconHome, label: "Dashboard", path: "/", roles: null },
  { icon: IconCalendar, label: "Absences", path: "/absences", roles: null },
  { icon: IconClock, label: "Timelogs", path: "/timelogs", roles: null }
];

const ownerItems: MenuItem[] = [
  {
    icon: IconUsers,
    label: "Employees",
    path: "/management/employees",
    roles: ["admin", "owner", "manager"]
  },

  {
    icon: IconCalendar,
    label: "Absence Tracker",
    path: "/management/absence-tracker",
    roles: ["admin", "owner", "manager"]
  },
  {
    icon: IconFileText,
    label: "Reports",
    path: "/management/reports",
    roles: ["admin", "owner", "manager"]
  },
  {
    icon: IconBuilding,
    label: "Companies",
    path: "/management/companies",
    roles: ["admin", "owner"]
  }
];

const adminItems: MenuItem[] = [
  { icon: IconUsers, label: "Users", path: "/admin/users", roles: ["admin"] },
  {
    icon: IconBuildingSkyscraper,
    label: "Owners",
    path: "/admin/owners",
    roles: ["admin", "owner"]
  }
];

function NavSection({
  title,
  items,
  userRole,
  location,
  onNavigate
}: {
  title: string;
  items: MenuItem[];
  userRole: string;
  location: { pathname: string };
  onNavigate: (path: string) => void;
}) {
  const visible = items.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );
  if (visible.length === 0) return null;

  return (
    <Stack gap={2}>
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        px="sm"
        pt="sm"
        tt="uppercase"
        style={{ letterSpacing: "0.05em" }}
      >
        {title}
      </Text>
      {visible.map((item) => (
        <NavLink
          key={item.path}
          active={location.pathname === item.path}
          label={item.label}
          leftSection={<item.icon size="1rem" stroke={1.5} />}
          rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
          onClick={() => onNavigate(item.path)}
        />
      ))}
      <Divider mt="xs" />
    </Stack>
  );
}

export function Navigation({ onNavigate }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role ?? "";

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <>
      <AppShell.Section grow>
        <NavSection
          title="My Space"
          items={employeeItems}
          userRole={role}
          location={location}
          onNavigate={handleNavigate}
        />
        <NavSection
          title="Management"
          items={ownerItems}
          userRole={role}
          location={location}
          onNavigate={handleNavigate}
        />
        <NavSection
          title="Site Admin"
          items={adminItems}
          userRole={role}
          location={location}
          onNavigate={handleNavigate}
        />
      </AppShell.Section>

      <Footer />
    </>
  );
}

export default Navigation;
