import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useMyOwner } from "@/hooks/useOwner";
import { useMyEmployee } from "@/hooks/useEmployee";
import { Center, Loader } from "@mantine/core";

interface ManagerOrOwnerOrAdminRouteProps {
  redirectTo?: string;
}

export function ManagerOrOwnerOrAdminRoute({
  redirectTo = "/"
}: ManagerOrOwnerOrAdminRouteProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { data: myOwner, isLoading: ownerLoading } = useMyOwner();
  const { data: myEmployee, isLoading: employeeLoading } = useMyEmployee();

  if (authLoading || ownerLoading || employeeLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === "admin";
  const isOwner = !!myOwner;
  const isManager = (myEmployee?.manageeIds?.length ?? 0) > 0;

  if (!isAdmin && !isOwner && !isManager) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
