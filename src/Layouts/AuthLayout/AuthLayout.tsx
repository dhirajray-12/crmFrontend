import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-app">
      <div className="bg-surface-strong/10 backdrop-blur-lg rounded-2xl shadow-xl p-10 w-[400px]">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
