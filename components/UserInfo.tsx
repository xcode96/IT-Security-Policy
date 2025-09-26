import React, { useState } from 'react';

interface UserInfoProps {
  onSubmit: (fullName: string, username: string) => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && username.trim()) {
      onSubmit(fullName, username);
    }
  };
  
  const commonInputClasses = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="p-8 text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">User Details</h2>
      <p className="text-gray-500 mb-8">Please provide your details for the training report.</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="w-full max-w-sm text-left">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Jane Doe"
            className={commonInputClasses}
            required
          />
        </div>
        <div className="w-full max-w-sm text-left">
          <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-2">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., jdoe"
            className={commonInputClasses}
            required
          />
        </div>
        <button
          type="submit"
          disabled={!fullName.trim() || !username.trim()}
          className="w-full mt-4 max-w-sm px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          Start Training
        </button>
      </form>
    </div>
  );
};

export default UserInfo;