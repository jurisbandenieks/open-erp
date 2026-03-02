import { Routes, Route, Navigate, BrowserRouter } from "react-router";

// Placeholder components
const Home = () => <h2>Home</h2>;
const About = () => <h2>About</h2>;

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* Redirect any unknown path to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
