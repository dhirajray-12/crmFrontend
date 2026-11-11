import React from "react";
import { Link } from "react-router-dom";

const Unauthorized: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center text-heading bg-gray-900">
    <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
    <p className="text-subtle mb-6">
      You do not have permission to view this page.
    </p>
    <Link
      to="/login"
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
    >
      Back to Login
    </Link>
  </div>
);

export default Unauthorized;
