import { useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email.trim());
      } else {
        localStorage.removeItem("rememberEmail");
      }
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" bg="gray.0">
      <Box w="100%" maw={440} px="md">
        <Stack gap="xs" mb="xl" ta="center">
          <Title order={2} fw={700}>
            Welcome back
          </Title>
          <Text c="dimmed" size="sm">
            Sign in to your OpenERP account
          </Text>
        </Stack>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                leftSection={<IconAt size={16} />}
                required
                autoComplete="email"
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                leftSection={<IconLock size={16} />}
                required
                autoComplete="current-password"
              />

              <Group justify="space-between">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.currentTarget.checked)}
                  size="sm"
                />
                <Anchor size="sm" component={Link} to="/forgot-password">
                  Forgot password?
                </Anchor>
              </Group>

              {error && (
                <Text c="red" size="sm" ta="center">
                  {error}
                </Text>
              )}

              <Button type="submit" fullWidth loading={loading} mt="xs">
                Sign in
              </Button>
            </Stack>
          </form>

          <Divider my="md" label="New to OpenERP?" labelPosition="center" />

          <Text ta="center" size="sm">
            Don&apos;t have an account?{" "}
            <Anchor component={Link} to="/register" fw={500}>
              Create one
            </Anchor>
          </Text>
        </Paper>
      </Box>
    </Center>
  );
}

export default LoginPage;
