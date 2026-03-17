import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useMyOwner } from "@/hooks/useOwner";
import { Center, Loader } from "@mantine/core";

interface OwnerOrAdminRouteProps {
  redirectTo?: string;
}

export function OwnerOrAdminRoute({
  redirectTo = "/"
}: OwnerOrAdminRouteProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { data: myOwner, isLoading: ownerLoading } = useMyOwner();

  if (authLoading || ownerLoading) {
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

  if (!isAdmin && !isOwner) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
