import { Routes, Route } from "react-router-dom";
import { lazyLoad } from "@/utils/lazyLoad";

const Login = lazyLoad("AuthPages/Login");
const CreateAccount = lazyLoad("AuthPages/CreateAccount");
const ResetPassword = lazyLoad("AuthPages/ResetPassword");
const ForgotPassword = lazyLoad("AuthPages/ForgotPassword");
const Unauthorized = lazyLoad("AuthPages/Unauthorized");

const AuthRoutes = () => (
  <Routes>
    <Route path="login" element={<Login />} />
    <Route path="/login/:role" element={<Login />} />
    <Route path="/create-account" element={<CreateAccount />} />
    <Route path="/signup/:referralCode" element={<CreateAccount />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
  </Routes>
);

export default AuthRoutes;
