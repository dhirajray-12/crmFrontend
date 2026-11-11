import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/Routes/ProtectedRoutes";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout/SuperAdminLayout";
import { lazyLoad } from "@/utils/lazyLoad";

// Lazy pages
const SuperAdminDashboard = lazyLoad("SuperAdminpage/Dashboard");
const ConfigurationPage = lazyLoad("SuperAdminpage/SidebarPages/Configuration");
const BillingSuspensionPage = lazyLoad(
  "SuperAdminpage/SidebarPages/BillingSuspension",
);
const EditAdminCredentials = lazyLoad(
  "SuperAdminpage/SidebarPages/EditAdminCredentials",
);

const SuperAdminRoutes = () => (
  <Routes>
    <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
      <Route element={<SuperAdminLayout />}>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="configuration" element={<ConfigurationPage />} />
        <Route path="billing-suspension" element={<BillingSuspensionPage />} />
        <Route
          path="edit-admin-credentials"
          element={<EditAdminCredentials />}
        />

        <Route
          path="*"
          element={<Navigate to="/superadmin/configuration" replace />}
        />
      </Route>
    </Route>
  </Routes>
);

export default SuperAdminRoutes;
