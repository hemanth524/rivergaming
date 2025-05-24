import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clear context & localStorage
    navigate("/"); // redirect to login
  };

  return (
    <header className="bg-gray-600 text-white p-4 flex justify-between items-center shadow-md">
      <div
        className="text-2xl font-bold cursor-pointer hover:opacity-90 transition"
        onClick={() => navigate("/")}
      >
        Live Streaming Platform
      </div>

      <div className="flex items-center gap-4">
        {user && <span className="hidden sm:inline text-sm">Welcome, {user.name}</span>}
        <button
          onClick={() => navigate("/")}
          className="bg-white text-red-600 px-3 py-1 rounded hover:bg-gray-100 text-sm font-medium"
        >
          Home
        </button>
        <button
          onClick={handleLogout}
          className="bg-white text-red-600 px-3 py-1 rounded hover:bg-gray-100 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
