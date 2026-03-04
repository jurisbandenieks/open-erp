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
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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
      navigate("/", { replace: true });
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
        </Paper>
      </Box>
    </Center>
  );
}

export default LoginPage;
