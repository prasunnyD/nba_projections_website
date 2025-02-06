import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // You can use any icon library for the show/hide icons

const Login = ({ setAuthenticated, setShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      // Replace with your backend login endpoint
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setAuthenticated(true);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      alert('An error occurred during login.');
    }
  };

   return (
    <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
      <div className="bg-neutral-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Sports Betting App</h1>
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 mb-3 border border-gray-500 rounded w-full text-black"
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border border-gray-500 rounded w-full text-black pr-12"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full mb-3"
        >
          Login
        </button>
        <button
          onClick={() => setAuthenticated(true)}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded w-full mb-4"
        >
          Skip Authentication (Testing)
        </button>
        <div className="text-center">
          <button
            onClick={() => setShowRegister(true)}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            New user? Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;