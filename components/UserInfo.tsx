import React, { useState } from 'react';

interface UserLoginProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean, message: string }>;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await onLogin(username, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  const commonInputClasses = "w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";
  
  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      {visible ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
      ) : (
        <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
      )}
    </svg>
  );

  return (
    <div className="w-full max-w-4xl bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row animate-fade-in">
        {/* Left Panel */}
        <div className="w-full md:w-2/5 p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="w-20 h-20 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-full mb-4 border-2 border-blue-500/20">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Security First</h1>
            <p className="mt-2 text-slate-400">Your commitment to security is crucial. This assessment ensures we maintain the highest standards of data protection.</p>
        </div>
        
        {/* Right Panel - Form */}
        <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">User Login</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className={commonInputClasses} required />
            </div>

            <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${commonInputClasses} pr-10`} required />
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                 >
                    <EyeIcon visible={!showPassword} />
                </button>
            </div>

            {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

            <button
                type="submit"
                disabled={!username.trim() || !password.trim()}
                className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
                Login
            </button>
            </form>
        </div>
    </div>
  );
};

export default UserLogin;