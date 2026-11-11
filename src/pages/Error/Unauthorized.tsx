import React from "react";
import { Link } from "react-router-dom";

const Unauthorized: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center">
    <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1>
    <p className="text-body mb-6">
      You don't have permission to view this page.
    </p>
    <Link
      to="/login"
      className="px-6 py-2 bg-blue-600 text-heading rounded-lg hover:bg-blue-700 transition"
    >
      Back to Login
    </Link>
  </div>
);

export default Unauthorized;
