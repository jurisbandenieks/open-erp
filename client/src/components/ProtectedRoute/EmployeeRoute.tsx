import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useMyEmployee } from "@/hooks/useEmployee";
import { Center, Loader } from "@mantine/core";

interface EmployeeRouteProps {
  redirectTo?: string;
}

export function EmployeeRoute({ redirectTo = "/" }: EmployeeRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: myEmployee, isLoading: employeeLoading } = useMyEmployee();

  if (authLoading || employeeLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!myEmployee) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
