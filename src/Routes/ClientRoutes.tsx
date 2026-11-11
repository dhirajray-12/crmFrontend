import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/Routes/ProtectedRoutes";
import ClientLayout from "@/Layouts/ClientLayout/ClientLayout";
import { lazyLoad } from "@/utils/lazyLoad";

// Lazy loaded pages
const ClientDashboard = lazyLoad("ClientPage/Dashboard");
const OpenNewAccount = lazyLoad(
  "ClientPage/SidebarPages/MyAccountPages/OpenNewAccount",
);
const AccountList = lazyLoad(
  "ClientPage/SidebarPages/MyAccountPages/AccountList",
);
const TradingContest = lazyLoad(
  "ClientPage/SidebarPages/MyAccountPages/TradingContest",
);

const TransferPage = lazyLoad(
  "ClientPage/SidebarPages/FinancialOperations/Transferpage",
);
const DepositPage = lazyLoad(
  "ClientPage/SidebarPages/FinancialOperations/DepositPage",
);
const WithdrawalPage = lazyLoad(
  "ClientPage/SidebarPages/FinancialOperations/WithdrawalPage",
);
const TransactionHistoryPage = lazyLoad(
  "ClientPage/SidebarPages/FinancialOperations/TransactionhistoryPage",
);

const ProfilePage = lazyLoad("ClientPage/DashboardComponents/ProfilePage");

const CreatePartnerAccount = lazyLoad(
  "ClientPage/SidebarPages/PartnerZonePages/CreateNewPartnerAccount",
);
const PartnerDashboard = lazyLoad(
  "ClientPage/SidebarPages/PartnerZonePages/PartnerDashboard",
);
const IBCommissionPage = lazyLoad(
  "ClientPage/SidebarPages/PartnerZonePages/IbCommissionPage",
);
const IBWithdrawalPage = lazyLoad(
  "ClientPage/SidebarPages/PartnerZonePages/IBWithdrawalPage",
);

const MasterPage = lazyLoad(
  "ClientPage/SidebarPages/CopytradingPages/MasterPage",
);
const TermsConditions = lazyLoad(
  "ClientPage/SidebarPages/CopytradingPages/TermsConditions",
);
const CopyTradingCRM = lazyLoad(
  "ClientPage/SidebarPages/CopytradingPages/Copierpage",
);
const CopyTradingRating = lazyLoad(
  "ClientPage/SidebarPages/CopytradingPages/RatingPage",
);

const PammFundsPage = lazyLoad("ClientPage/SidebarPages/PammPages/FundsPage");
const PammMyInvestmentsPage = lazyLoad(
  "ClientPage/SidebarPages/PammPages/MyInvestmentsPage",
);
const PammMyFundPage = lazyLoad("ClientPage/SidebarPages/PammPages/MyFundPage");

const TradingPlatform = lazyLoad(
  "ClientPage/SidebarPages/TradingPlatform/TradingPlatform",
);
const TradeView = lazyLoad(
  "ClientPage/SidebarPages/TradingPlatform/TradeView",
);
const ReferAFriend = lazyLoad("ClientPage/SidebarPages/ReferAFriend/Refer");
const MyEnquiriesPage = lazyLoad(
  "ClientPage/SidebarPages/CustomerSupportpage/MyEnquiryPage",
);

const ClientRoutes = () => (
  <Routes>
    <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
      <Route element={<ClientLayout />}>
        <Route path="dashboard" element={<ClientDashboard />} />

        <Route path="open-account" element={<OpenNewAccount />} />
        <Route path="account-list" element={<AccountList />} />
        <Route path="trading-contest" element={<TradingContest />} />

        <Route path="transfer" element={<TransferPage />} />
        <Route path="deposit" element={<DepositPage />} />
        <Route path="withdrawal" element={<WithdrawalPage />} />
        <Route path="transfer-history" element={<TransactionHistoryPage />} />

        <Route path="profile" element={<ProfilePage />} />

        <Route path="partner/create" element={<CreatePartnerAccount />} />
        <Route path="partner/dashboard" element={<PartnerDashboard />} />
        <Route path="partner/commission" element={<IBCommissionPage />} />
        <Route path="partner/withdrawal" element={<IBWithdrawalPage />} />

        <Route path="copy/master" element={<MasterPage />} />
        <Route path="copy/terms" element={<TermsConditions />} />
        <Route path="copy/copier" element={<CopyTradingCRM />} />
        <Route path="copy/rating" element={<CopyTradingRating />} />

        <Route path="pamm/funds" element={<PammFundsPage />} />
        <Route path="pamm/my-investments" element={<PammMyInvestmentsPage />} />
        <Route path="pamm/my-fund" element={<PammMyFundPage />} />

        <Route path="platforms" element={<TradingPlatform />} />
        <Route path="trade-view" element={<TradeView />} />
        <Route path="refer" element={<ReferAFriend />} />
        <Route path="support" element={<MyEnquiriesPage />} />

        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
      </Route>
    </Route>
  </Routes>
);

export default ClientRoutes;
