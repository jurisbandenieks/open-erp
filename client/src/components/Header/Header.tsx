import {
  AppShell,
  Burger,
  Group,
  Text,
  UnstyledButton,
  Avatar,
  Menu,
  rem,
  Badge
} from "@mantine/core";
import { IconSettings, IconLogout, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  opened: boolean;
  onToggle: () => void;
}

export function Header({ opened, onToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Burger
            opened={opened}
            onClick={onToggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Text size="xl" fw={700}>
            Open ERP
          </Text>
        </Group>

        <Menu shadow="md" width={220}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap="xs">
                <Avatar radius="xl" size="sm" color="dark">
                  {initials}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Group gap={6} align="center">
                    <Text size="sm" fw={500}>
                      {fullName}
                    </Text>
                    {user?.role && (
                      <Badge
                        size="xs"
                        variant="light"
                        color="gray"
                        tt="capitalize"
                      >
                        {user.role}
                      </Badge>
                    )}
                  </Group>
                  <Text c="dimmed" size="xs">
                    {user?.email}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item
              leftSection={
                <IconUser style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => navigate("/profile")}
            >
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconSettings style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => navigate("/settings")}
            >
              Settings
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              color="red"
              leftSection={
                <IconLogout style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={logout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </AppShell.Header>
  );
}

export default Header;
