import React, { useState } from 'react';

interface UserLoginProps {
  onLogin: (username: string, password: string) => { success: boolean, message: string };
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(username, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  const commonInputClasses = "w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="w-full max-w-4xl bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-fade-in">
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
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">Employee ID</label>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your Employee ID" className={commonInputClasses} required />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={commonInputClasses} required />
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