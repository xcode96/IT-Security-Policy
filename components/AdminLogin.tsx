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
  
  const commonInputClasses = "w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="min-h-screen w-full font-sans bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
          <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-2 tracking-tight">Admin Access</h1>
              <p className="text-lg text-slate-400">Please enter the password to continue.</p>
          </header>
          <main>
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm p-8">
                  <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                      <div className="w-full text-left">
                          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
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
                      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                      <button
                          type="submit"
                          className="w-full mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md shadow-blue-500/20"
                      >
                          Login
                      </button>
                  </form>
              </div>
          </main>
      </div>
    </div>
  );
};

export default AdminLogin;