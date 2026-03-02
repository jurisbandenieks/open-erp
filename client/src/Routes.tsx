import { Routes, Route, BrowserRouter } from "react-router";
import NotFound from "@/views/NotFound/NotFound";
import { Timelogs } from "@/views/Timelogs/Timelogs";
import Layout from "./components/Layout/Layout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout />}
          children={[
            <Route path="timelogs" element={<Timelogs />} />,
            <Route path="admin" element={<div>Admin</div>} />
          ]}
        />
        {/* Redirect any unknown path to home */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
