import React, { useState } from 'react';
import { useToast } from './ToastProvider';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => { success: boolean; message: string };
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onLogin(username, password);
    if (!result.success) {
      toast.error(result.message);
    }
  };
  
  const commonInputClasses = "w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      {visible ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen w-full font-sans bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
          <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-2 tracking-tight">Admin Access</h1>
              <p className="text-lg text-slate-400">Please enter your credentials to continue.</p>
          </header>
          <main>
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm p-8">
                  <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                      <div className="w-full text-left">
                          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                          <input
                              id="username"
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Enter admin username"
                              className={commonInputClasses}
                              required
                          />
                      </div>
                      <div className="w-full text-left relative">
                          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                          <input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`${commonInputClasses} pr-10`}
                              required
                          />
                          <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-200 transition-colors"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                              <EyeIcon visible={!showPassword} />
                          </button>
                      </div>
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