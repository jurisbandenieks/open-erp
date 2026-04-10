import { Button } from "@mantine/core";
import { useNavigate } from "react-router";

export function QuickLink({
  to,
  label,
  icon
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Button
      variant="light"
      leftSection={icon}
      onClick={() => navigate(to)}
      size="sm"
    >
      {label}
    </Button>
  );
}
