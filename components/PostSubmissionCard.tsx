import React, { useState, useEffect } from 'react';
import { RetakeRequest } from '../types';

interface PostSubmissionCardProps {
  user: { fullName: string; username: string } | null;
  overallResult: boolean;
  onLogout: () => void;
}

const PostSubmissionCard: React.FC<PostSubmissionCardProps> = ({ user, overallResult, onLogout }) => {
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (requestSent) {
      const timer = setTimeout(() => {
        onLogout();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [requestSent, onLogout]);

  const handleRequest = () => {
    if (!overallResult && user) {
        // This is a retake request, save it to localStorage for the admin
        const savedRequestsRaw = localStorage.getItem('retakeRequests');
        const savedRequests: RetakeRequest[] = savedRequestsRaw ? JSON.parse(savedRequestsRaw) : [];
        
        const newRequest: RetakeRequest = {
            username: user.username,
            fullName: user.fullName,
            requestDate: new Date().toISOString()
        };

        // Avoid adding duplicate pending requests for the same user
        if (!savedRequests.some(req => req.username.toLowerCase() === user.username.toLowerCase())) {
            savedRequests.push(newRequest);
            localStorage.setItem('retakeRequests', JSON.stringify(savedRequests));
        }
    }
    setRequestSent(true);
  };

  const PassIcon = () => (
    <svg className="w-16 h-16 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const FailIcon = () => (
     <svg className="w-16 h-16 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );

   const SentIcon = () => (
    <svg className="w-16 h-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (requestSent) {
    return (
      <div className="p-6 md:p-12 animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <SentIcon />
        </div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Request Submitted</h2>
        <p className="text-slate-400">Your request has been sent to the administrator. You will be logged out shortly.</p>
      </div>
    );
  }

  if (overallResult) {
    return (
      <div className="p-6 md:p-12 animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <PassIcon />
        </div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Congratulations, You Passed!</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">You have met the passing requirement for the IT Security Policy training. Please request your certificate of completion.</p>
        <button
          onClick={handleRequest}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md shadow-blue-500/20"
        >
          Request Certificate
        </button>
      </div>
    );
  } else {
    return (
      <div className="p-6 md:p-12 animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <FailIcon />
        </div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Requirement Not Met</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Unfortunately, you did not meet the passing requirement for this assessment. Please request approval to retake the training.</p>
        <button
          onClick={handleRequest}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md shadow-blue-500/20"
        >
          Request Approval to Retake
        </button>
      </div>
    );
  }
};

export default PostSubmissionCard;