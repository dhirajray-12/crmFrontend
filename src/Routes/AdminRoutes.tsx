import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/Routes/ProtectedRoutes";
import PermissionRoute from "@/Routes/PermissionRoute";
import AdminOnlyRoute from "@/Routes/AdminOnlyRoute";
import AdminLayout from "@/Layouts/AdminLayout/AdminLayout";
import { lazyLoad } from "@/utils/lazyLoad";
import { useAuthStore } from "@/Store/auth.store";
import { PERMISSIONS } from "@/Constants/permissions";

const AdminDashboard = lazyLoad("Adminpage/AdminDashboard");
const KYCVerificationPage = lazyLoad(
  "Adminpage/AdminPages/KYCVerificationPage",
);
const AdminDepositPage = lazyLoad("Adminpage/AdminPages/Depositpage");
const ClientListPage = lazyLoad("Adminpage/AdminPages/ClientListPage");
const AddPaymentMethodPage = lazyLoad("Adminpage/AdminPages/AddPayment");
const AdminCopy = lazyLoad("Adminpage/AdminPages/AdminCopy");
const AdminMaster = lazyLoad("Adminpage/AdminPages/AdminMaster");
const AdminRating = lazyLoad("Adminpage/AdminPages/AdminRating");
const AdminTransactionsPage = lazyLoad(
  "Adminpage/AdminPages/AdminTransactionPage",
);
const AdminCustomerSupport = lazyLoad(
  "Adminpage/AdminPages/AdminCustomerSupport",
);
const IBConfigurationManagement = lazyLoad(
  "Adminpage/AdminPages/IBConfigurationManagement",
);
const IBWithdrawalManagement = lazyLoad(
  "Adminpage/AdminPages/IBWithdrawalManagement",
);
const PartnersManagement = lazyLoad(
  "Adminpage/AdminPages/PartnersManagement",
);
const PartnerDetailPage = lazyLoad(
  "Adminpage/AdminPages/PartnerDetailPage",
);
const WithdrawalPage = lazyLoad("Adminpage/AdminPages/Withdrawalpage");
const EmailLogsPage = lazyLoad("Adminpage/AdminPages/EmailLogsPage");
const SubadminListPage = lazyLoad("Adminpage/AdminPages/SubadminListPage");
const SubadminFormPage = lazyLoad("Adminpage/AdminPages/SubadminFormPage");
const AdminPamm = lazyLoad("Adminpage/AdminPages/AdminPamm");

const AdminRoutes = () => {
  const user = useAuthStore((state) => state.user);
  const isAgent = user?.role === "agent";
  const supportRedirect = <Navigate to="/admin/Admin-customer-support" replace />;

  // Wraps a page so subadmins without the given permission bounce to the
  // dashboard. Admin/superadmin/agent behavior is unaffected — this is a
  // UX layer only, the backend authorizePermission middleware is authoritative.
  const withPermission = (permission: string, element: ReactNode) =>
    isAgent ? (
      supportRedirect
    ) : (
      <PermissionRoute permission={permission}>{element}</PermissionRoute>
    );

  return (
    <Routes>
      <Route
        element={<ProtectedRoute allowedRoles={["admin", "agent", "subadmin"]} />}
      >
        <Route element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={withPermission(PERMISSIONS.DASHBOARD_VIEW, <AdminDashboard />)}
          />
          <Route
            path="withdrawals"
            element={withPermission(PERMISSIONS.WITHDRAWALS_VIEW, <WithdrawalPage />)}
          />
          <Route
            path="kyc-verification"
            element={withPermission(PERMISSIONS.KYC_VIEW, <KYCVerificationPage />)}
          />
          <Route
            path="deposits"
            element={withPermission(PERMISSIONS.DEPOSITS_VIEW, <AdminDepositPage />)}
          />
          <Route
            path="client-page"
            element={withPermission(PERMISSIONS.CLIENTS_VIEW, <ClientListPage />)}
          />
          <Route
            path="add-payments"
            element={withPermission(PERMISSIONS.PAYMENTS_VIEW, <AddPaymentMethodPage />)}
          />
          <Route
            path="admin-Copy-page"
            element={withPermission(PERMISSIONS.COPY_COPIER_VIEW, <AdminCopy />)}
          />
          <Route
            path="Admin-masters-page"
            element={withPermission(PERMISSIONS.COPY_MASTERS_VIEW, <AdminMaster />)}
          />
          <Route
            path="Admin-rating-page"
            element={withPermission(PERMISSIONS.COPY_RATING_VIEW, <AdminRating />)}
          />
          <Route
            path="Admin-transaction-page"
            element={withPermission(PERMISSIONS.TRANSACTIONS_VIEW, <AdminTransactionsPage />)}
          />
          <Route
            path="admin-pamm-page"
            element={withPermission(PERMISSIONS.PAMM_VIEW, <AdminPamm />)}
          />
          <Route
            path="Admin-customer-support"
            element={withPermission(PERMISSIONS.SUPPORT_VIEW, <AdminCustomerSupport />)}
          />
          <Route
            path="IB-Configuration"
            element={withPermission(PERMISSIONS.IB_CONFIGURATION_VIEW, <IBConfigurationManagement />)}
          />
          <Route
            path="IB-Withdrawals"
            element={withPermission(PERMISSIONS.IB_WITHDRAWAL_VIEW, <IBWithdrawalManagement />)}
          />
          <Route
            path="Partners"
            element={withPermission(PERMISSIONS.IB_PARTNERS_VIEW, <PartnersManagement />)}
          />
          <Route
            path="Partners/:id"
            element={withPermission(PERMISSIONS.IB_PARTNERS_VIEW, <PartnerDetailPage />)}
          />
          <Route
            path="email-logs"
            element={withPermission(PERMISSIONS.EMAIL_LOGS_VIEW, <EmailLogsPage />)}
          />
          <Route
            path="subadmins"
            element={
              isAgent ? (
                supportRedirect
              ) : (
                <AdminOnlyRoute>
                  <SubadminListPage />
                </AdminOnlyRoute>
              )
            }
          />
          <Route
            path="subadmins/new"
            element={
              isAgent ? (
                supportRedirect
              ) : (
                <AdminOnlyRoute>
                  <SubadminFormPage />
                </AdminOnlyRoute>
              )
            }
          />
          <Route
            path="subadmins/:id/edit"
            element={
              isAgent ? (
                supportRedirect
              ) : (
                <AdminOnlyRoute>
                  <SubadminFormPage />
                </AdminOnlyRoute>
              )
            }
          />
          <Route
            path="*"
            element={<Navigate to="/admin/Admin-customer-support" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
