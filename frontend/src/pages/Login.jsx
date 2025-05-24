import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Login = ({ switchToSignup }) => {
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      navigate(res.data.user.role === "admin" ? "/admin" : "/userdashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col text-white"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

      <input
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full mb-4 p-3 rounded bg-white/20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <input
        name="password"
        type="password"
        required
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full mb-4 p-3 rounded bg-white/20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition mb-2"
      >
        Login
      </button>

      <p className="text-center mt-4 text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={switchToSignup}
          className="text-blue-300 hover:underline"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default Login;
