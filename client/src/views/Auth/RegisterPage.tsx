import { useState } from "react";
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
import { Link, useNavigate, Navigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setServerError(null);
    try {
      await authApi.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password
      });
      navigate("/login", {
        state: { registered: true },
        replace: true
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
      setServerError(message);
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="First name"
                    placeholder="Jane"
                    leftSection={<IconUser size={16} />}
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                    {...register("firstName", {
                      required: "First name is required"
                    })}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Last name"
                    placeholder="Doe"
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                    {...register("lastName", {
                      required: "Last name is required"
                    })}
                  />
                </Grid.Col>
              </Grid>

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
                description="Minimum 8 characters"
                placeholder="Create a password"
                leftSection={<IconLock size={16} />}
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
              />

              <PasswordInput
                label="Confirm password"
                placeholder="Repeat your password"
                leftSection={<IconLock size={16} />}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) =>
                    val === watch("password") || "Passwords do not match"
                })}
              />

              {serverError && (
                <Text c="red" size="sm" ta="center">
                  {serverError}
                </Text>
              )}

              <Button type="submit" fullWidth loading={isSubmitting} mt="xs">
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
