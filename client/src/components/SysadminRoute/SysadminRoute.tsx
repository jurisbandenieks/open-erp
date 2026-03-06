import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Center, Loader } from "@mantine/core";

interface SysadminRouteProps {
  redirectTo?: string;
}

export function SysadminRoute({ redirectTo = "/" }: SysadminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
