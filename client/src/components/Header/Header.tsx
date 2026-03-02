import {
  AppShell,
  Burger,
  Group,
  Text,
  UnstyledButton,
  Avatar,
  Menu,
  rem
} from "@mantine/core";
import { IconSettings, IconLogout, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router";

interface HeaderProps {
  opened: boolean;
  onToggle: () => void;
}

export function Header({ opened, onToggle }: HeaderProps) {
  const navigate = useNavigate();

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

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap="xs">
                <Avatar
                  src="https://i.pravatar.cc/150?img=1"
                  alt="User"
                  radius="xl"
                  size="sm"
                />
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    John Smith
                  </Text>
                  <Text c="dimmed" size="xs">
                    john.smith@company.com
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
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                navigate("/login");
              }}
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
