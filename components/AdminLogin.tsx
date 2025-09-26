import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(password);
    if (!success) {
      setError('Invalid password. Please try again.');
    }
  };
  
  const commonInputClasses = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 tracking-tight">Admin Access</h1>
            <p className="text-lg text-gray-500">Please enter the password to continue.</p>
        </header>
        <main className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                <div className="w-full text-left">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={commonInputClasses}
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                    type="submit"
                    className="w-full mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
                >
                    Login
                </button>
            </form>
        </main>
      </div>
    </div>
  );
};

export default AdminLogin;
