import { useState, type FormEvent } from "react";
import {
  Anchor,
  Box,
  Button,
  Center,
  Divider,
  Grid,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { IconAt, IconLock, IconUser } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router";
import { axiosClient } from "@/api/client";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL: RegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.currentTarget.value }));

  const validate = (): string | null => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/v1/users", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password
      });
      navigate("/login", {
        state: { registered: true },
        replace: true
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" bg="gray.0">
      <Box w="100%" maw={480} px="md">
        <Stack gap="xs" mb="xl" ta="center">
          <Title order={2} fw={700}>
            Create your account
          </Title>
          <Text c="dimmed" size="sm">
            Get started with OpenERP today
          </Text>
        </Stack>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="First name"
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={set("firstName")}
                    leftSection={<IconUser size={16} />}
                    required
                    autoComplete="given-name"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Last name"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={set("lastName")}
                    required
                    autoComplete="family-name"
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Email address"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                leftSection={<IconAt size={16} />}
                required
                autoComplete="email"
              />

              <PasswordInput
                label="Password"
                description="Minimum 8 characters"
                placeholder="Create a password"
                value={form.password}
                onChange={set("password")}
                leftSection={<IconLock size={16} />}
                required
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                leftSection={<IconLock size={16} />}
                required
                autoComplete="new-password"
              />

              {error && (
                <Text c="red" size="sm" ta="center">
                  {error}
                </Text>
              )}

              <Button type="submit" fullWidth loading={loading} mt="xs">
                Create account
              </Button>
            </Stack>
          </form>

          <Divider
            my="md"
            label="Already have an account?"
            labelPosition="center"
          />

          <Text ta="center" size="sm">
            <Anchor component={Link} to="/login" fw={500}>
              Sign in instead
            </Anchor>
          </Text>
        </Paper>
      </Box>
    </Center>
  );
}

export default RegisterPage;
