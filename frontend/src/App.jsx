import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider, SocketContext } from "./context/SocketContext";
import { useContext } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";

// Wrapper component to inject socket into AdminDashboard
const AdminDashboardWithSocket = () => {
  const socket = useContext(SocketContext);
  return <AdminDashboard socket={socket} />;
};

// Wrapper component to inject socket into UserDashboard
const UserDashboardWithSocket = () => {
  const socket = useContext(SocketContext);
  return <UserDashboard socket={socket} />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
       
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Header/>
            <Routes>
              
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<AdminDashboardWithSocket />} />
              <Route path="/userdashboard" element={<UserDashboardWithSocket />} />
            </Routes>
          </div>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
