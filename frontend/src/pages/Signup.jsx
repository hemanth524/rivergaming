import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Signup = ({ switchToLogin }) => {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      setUser(res.data.user);
      // Do NOT navigate on signup, just switch to login form:
      switchToLogin();
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col text-white"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

      <input
        name="name"
        required
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full mb-4 p-3 rounded bg-white/20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full mb-4 p-3 rounded bg-white/20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        name="password"
        type="password"
        required
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full mb-4 p-3 rounded bg-white/20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Role select */}
      <label className="block mb-1 font-medium">Role</label>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full mb-6 p-3 rounded bg-white/20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition mb-2"
      >
        Sign Up
      </button>

      <p className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-purple-300 hover:underline"
        >
          Login
        </button>
      </p>
    </form>
  );
};

export default Signup;
