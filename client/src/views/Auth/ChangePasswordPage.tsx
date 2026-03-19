import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordPage() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ChangePasswordFormValues>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async ({
    currentPassword,
    newPassword
  }) => {
    if (!accessToken) return;
    setServerError(null);
    try {
      await authApi.changePassword(accessToken, currentPassword, newPassword);
      // Update stored user so mustChangePassword is cleared
      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to change password. Please try again.";
      setServerError(message);
    }
  };

  return (
    <Center mih="100vh" bg="gray.0">
      <Box w="100%" maw={440} px="md">
        <Stack gap="xs" mb="xl" ta="center">
          <Title order={2} fw={700}>
            Set your password
          </Title>
          <Text c="dimmed" size="sm">
            Your account requires a password change before you can continue.
          </Text>
        </Stack>

        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <PasswordInput
                label="Current password"
                placeholder="Enter your current password"
                leftSection={<IconLock size={16} />}
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                {...register("currentPassword", {
                  required: "Current password is required"
                })}
              />

              <PasswordInput
                label="New password"
                placeholder="At least 8 characters"
                leftSection={<IconLock size={16} />}
                autoComplete="new-password"
                error={errors.newPassword?.message}
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
              />

              <PasswordInput
                label="Confirm new password"
                placeholder="Repeat your new password"
                leftSection={<IconLock size={16} />}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match"
                })}
              />

              {serverError && (
                <Text c="red" size="sm" ta="center">
                  {serverError}
                </Text>
              )}

              <Button type="submit" fullWidth loading={isSubmitting} mt="xs">
                Change password
              </Button>

              <Button
                variant="subtle"
                color="gray"
                fullWidth
                onClick={() => logout()}
              >
                Sign out
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Center>
  );
}

export default ChangePasswordPage;
