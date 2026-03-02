import { AppShell, Text } from '@mantine/core';

export function Footer() {
  return (
    <AppShell.Section>
      <Text size="xs" c="dimmed" ta="center" mt="md">
        © 2026 Open ERP. All rights reserved.
      </Text>
    </AppShell.Section>
  );
}

export default Footer;
