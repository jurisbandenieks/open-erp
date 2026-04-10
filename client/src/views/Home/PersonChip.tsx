import { Badge } from "@mantine/core";

export function PersonChip({
  name,
  onClick
}: {
  name: string;
  onClick?: () => void;
}) {
  return (
    <Badge
      variant="outline"
      size="lg"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      {name}
    </Badge>
  );
}
