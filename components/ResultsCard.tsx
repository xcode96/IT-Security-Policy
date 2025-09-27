import React from 'react';

interface ResultsCardProps {
  onReturnToHub: () => void;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ onReturnToHub }) => {
  const CompleteIcon = () => (
    <svg className="w-16 h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="text-center p-6 md:p-8 animate-fade-in">
      <div className="flex justify-center mb-4">
        <CompleteIcon />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-2">
        Quiz Complete
      </h2>

      <p className="text-slate-500 text-lg mb-8">Your progress has been saved.</p>

      <button
        onClick={onReturnToHub}
        className="w-full mt-4 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-lg shadow-indigo-500/20"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default ResultsCard;