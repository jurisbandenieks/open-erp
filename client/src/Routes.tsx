import { Routes, Route, BrowserRouter } from "react-router";
import NotFound from "@/views/NotFound/NotFound";
import { Timelogs } from "@/views/Timelogs/Timelogs";
import { Home } from "@/views/Home/Home";
import { Owners } from "@/views/Owners/Owners";
import { Users } from "@/views/Users/Users";
import { Employees } from "@/views/Employees/Employees";
import { Companies } from "@/views/Companies/Companies";
import Layout from "./components/Layout/Layout";
import LoginPage from "@/views/Auth/LoginPage";
import RegisterPage from "@/views/Auth/RegisterPage";
import ChangePasswordPage from "@/views/Auth/ChangePasswordPage";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { SysadminRoute } from "@/components/ProtectedRoute/SysadminRoute";
import { OwnerOrAdminRoute } from "@/components/ProtectedRoute/OwnerOrAdminRoute";
import { ManagerOrOwnerOrAdminRoute } from "@/components/ProtectedRoute/ManagerOrOwnerOrAdminRoute";
import { AuthProvider } from "@/context/AuthContext";
import { Absences } from "./views/Absences/Absences";
import { AbsencesManagement } from "./views/AbsencesManagement/AbsencesManagement";
import { Approvals } from "./views/Approvals/Approvals";
import { Reports } from "./views/Reports/Reports";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes (no navbar/sidebar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected application routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/" element={<Layout />}>
              {/* Employee section */}
              <Route index element={<Home />} />
              <Route path="absences" element={<Absences />} />
              <Route path="timelogs" element={<Timelogs />} />

              {/* Management section */}
              <Route path="management">
                <Route element={<OwnerOrAdminRoute />}>
                  <Route path="employees" element={<Employees />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="reports" element={<Reports />} />
                </Route>
                <Route element={<ManagerOrOwnerOrAdminRoute />}>
                  <Route
                    path="absence-tracker"
                    element={<AbsencesManagement />}
                  />
                  <Route path="approvals" element={<Approvals />} />
                </Route>
              </Route>

              {/* Admin section */}
              <Route path="admin">
                <Route element={<SysadminRoute />}>
                  <Route path="users" element={<Users />} />
                </Route>
                <Route element={<OwnerOrAdminRoute />}>
                  <Route path="owners" element={<Owners />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* Redirect any unknown path to home */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
