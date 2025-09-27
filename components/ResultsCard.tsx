import React from 'react';

interface ResultsCardProps {
  onReturnToHub: () => void;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ onReturnToHub }) => {
  const CompleteIcon = () => (
    <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="text-center p-6 md:p-12 animate-fade-in">
      <div className="flex justify-center mb-6">
        <CompleteIcon />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-100 mb-8">
        Module Complete
      </h2>

      <button
        onClick={onReturnToHub}
        className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/20"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default ResultsCard;
