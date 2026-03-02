import { Container, Title, Text, Button, Group, Center } from "@mantine/core";
import { useNavigate } from "react-router";
export function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Center style={{ minHeight: "100vh", flexDirection: "column" }}>
        <div>404</div>
        <Title>You have found a secret place.</Title>
        <Text c="dimmed" size="lg" ta="center">
          Unfortunately, this is only a 404 page. You may have mistyped the
          address, or the page has been moved to another URL.
        </Text>
        <Group justify="center" mt="xl">
          <Button variant="subtle" size="md" onClick={() => navigate("/")}>
            Take me back to home page
          </Button>
        </Group>
      </Center>
    </Container>
  );
}

export default NotFound;
