import { Routes, Route, BrowserRouter } from "react-router";
import NotFound from "@/views/NotFound/NotFound";
import { Timelogs } from "@/views/Timelogs/Timelogs";
import Layout from "./components/Layout/Layout";
import LoginPage from "@/views/Auth/LoginPage";
import RegisterPage from "@/views/Auth/RegisterPage";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes (no navbar/sidebar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected application routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Dashboard</div>} />
            <Route path="timelogs" element={<Timelogs />} />
            <Route path="admin" element={<div>Admin</div>} />
          </Route>
        </Route>

        {/* Redirect any unknown path to home */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
