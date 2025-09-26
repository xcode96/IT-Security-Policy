import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="p-8 text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Admin Access</h2>
      <p className="text-gray-500 mb-8">Please enter the password to manage quiz questions.</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full max-w-sm p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Admin Password"
        />
        <button
          type="submit"
          className="w-full max-w-sm px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;