import { Group, Text } from "@mantine/core";

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
  align?: "center" | "flex-start";
}

export function DetailRow({ label, children, align }: DetailRowProps) {
  return (
    <Group justify="space-between" align={align}>
      <Text fw={500}>{label}</Text>
      {children}
    </Group>
  );
}
