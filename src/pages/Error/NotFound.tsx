import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-heading text-center">
    <h1 className="text-5xl font-bold mb-3">404</h1>
    <p className="text-subtle mb-5">Page Not Found</p>
    <Link
      to="/login"
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
    >
      Go to Login
    </Link>
  </div>
);

export default NotFound;
