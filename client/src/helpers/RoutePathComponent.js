import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
const Dashboard = lazy(() => import("../pages/dashboard"));

const RoutePathComponent = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
};
export default RoutePathComponent;
