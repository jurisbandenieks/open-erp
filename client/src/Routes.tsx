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
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { SysadminRoute } from "@/components/SysadminRoute/SysadminRoute";
import { OwnerOrAdminRoute } from "@/components/OwnerOrAdminRoute/OwnerOrAdminRoute";
import { AuthProvider } from "@/context/AuthContext";
import { Absences } from "./views/Absences/Absences";

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
                  <Route
                    path="absence-tracker"
                    element={<div>Absence Tracker</div>}
                  />
                  <Route path="reports" element={<div>Reports</div>} />
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
