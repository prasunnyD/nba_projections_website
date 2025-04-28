import React, { useState } from "react";

const Register = ({ setShowRegister }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!"); // Set error message if passwords don't match
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName, // Matches backend "full_name"
          username: username, // Matches backend "username"
          password: password, // Matches backend "password"
        }),
      });

      if (response.ok) {
        alert("Registration successful! Please log in.");
        setShowRegister(false); // Navigate back to login
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || "Registration failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred during registration.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="p-2 mb-2 border border-gray-400 rounded w-64"
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 mb-2 border border-gray-400 rounded w-64"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 mb-2 border border-gray-400 rounded w-64"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="p-2 mb-2 border border-gray-400 rounded w-64"
      />
      {errorMessage && (
        <div className="text-red-500 mb-2 text-sm">{errorMessage}</div> // Display error message
      )}
      <button
        onClick={handleRegister}
        className="bg-green-500 px-4 py-2 rounded text-white"
      >
        Register
      </button>
      <button
        onClick={() => setShowRegister(false)}
        className="mt-2 text-blue-300 underline"
      >
        Back to Login
      </button>
    </div>
  );
};

export default Register;
