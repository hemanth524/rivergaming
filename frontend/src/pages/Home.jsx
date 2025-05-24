import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const Home = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-purple-900 to-purple-700 text-white">
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
          Welcome to Live Quiz Battle!
        </h1>
        <p className="text-lg md:text-xl text-center max-w-md">
          Join live quizzes, bet points, win rewards, and challenge others in real-time!
        </p>
      </div>

      {/* Right Section (Login/Signup) */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        {showLogin ? (
          <Login switchToSignup={() => setShowLogin(false)} />
        ) : (
          <Signup switchToLogin={() => setShowLogin(true)} />
        )}
      </div>
      {/* For mobile, show form below */}
      <div className="md:hidden w-full  flex items-center justify-center p-4">
        {showLogin ? (
          <Login switchToSignup={() => setShowLogin(false)} />
        ) : (
          <Signup switchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default Home;
