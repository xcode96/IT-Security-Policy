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
  
  const commonInputClasses = "w-full p-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="min-h-screen w-full font-sans bg-slate-100">
      <header className="w-full pt-20 pb-8 px-4">
          <div className="text-center max-w-md mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">Admin Access</h1>
              <p className="text-lg text-slate-500">Please enter the password to continue.</p>
          </div>
      </header>
      <main className="w-full max-w-sm mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                  <div className="w-full text-left">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
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
                  {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
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
  );
};

export default AdminLogin;