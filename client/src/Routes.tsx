import { Routes, Route, BrowserRouter } from "react-router";
import { Home } from "@/views/Home/Home";
import NotFound from "@/views/NotFound/NotFound";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Redirect any unknown path to home */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
