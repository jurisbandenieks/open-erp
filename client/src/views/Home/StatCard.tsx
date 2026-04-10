import { Paper, Group, ThemeIcon, Text } from "@mantine/core";

export function StatCard({
  icon,
  label,
  value,
  color = "blue"
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group>
        <ThemeIcon size="lg" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text fw={700} size="lg">
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
