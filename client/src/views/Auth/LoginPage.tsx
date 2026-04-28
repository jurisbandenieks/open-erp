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
import { Link, Navigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

const DEV_USERS = [
  {
    label: "Sysadmin",
    email: "sysadmin@openerp.local",
    password: "Testing1!",
    color: "red"
  },
  {
    label: "Admin",
    email: "admin@openerp.dev",
    password: "Password123!",
    color: "blue"
  },
  {
    label: "Owner",
    email: "owner@openerp.dev",
    password: "Password123!",
    color: "grape"
  },
  {
    label: "Manager — Alice",
    email: "alice.manager@openerp.dev",
    password: "Password123!",
    color: "teal"
  },
  {
    label: "Manager — Bob",
    email: "bob.manager@openerp.dev",
    password: "Password123!",
    color: "teal"
  }
];

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" }
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async ({
    email,
    password
  }) => {
    setServerError(null);
    try {
      await login({ email, password });
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }
      // navigation is handled inside AuthContext.login()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid email or password.";
      setServerError(message);
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email address"
                placeholder="you@example.com"
                leftSection={<IconAt size={16} />}
                autoComplete="email"
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address"
                  }
                })}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                leftSection={<IconLock size={16} />}
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required"
                })}
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

              {serverError && (
                <Text c="red" size="sm" ta="center">
                  {serverError}
                </Text>
              )}

              <Button type="submit" fullWidth loading={isSubmitting} mt="xs">
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

          {import.meta.env.DEV && (
            <>
              <Divider my="md" label="Dev quick login" labelPosition="center" />
              <Stack gap="xs">
                {DEV_USERS.map(({ label, email, password, color }) => (
                  <Button
                    key={email}
                    variant="light"
                    color={color}
                    size="xs"
                    fullWidth
                    onClick={() => {
                      setValue("email", email);
                      setValue("password", password);
                      handleSubmit(onSubmit)();
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </>
          )}
        </Paper>
      </Box>
    </Center>
  );
}

export default LoginPage;
