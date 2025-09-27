import React from 'react';
import { QuizProgress, Quiz, User } from '../types';
import TopicIcon from './TopicIcon';

interface QuizHubProps {
  user: { fullName: string; username: string; };
  quizzes: Quiz[];
  quizProgress: QuizProgress;
  onStartQuiz: (quizId: string) => void;
  onGenerateReport: () => void;
}

const QuizHub: React.FC<QuizHubProps> = ({ user, quizzes, quizProgress, onStartQuiz, onGenerateReport }) => {

  const allQuizzesCompleted = Object.values(quizProgress).every(
    (quiz) => quiz.status === 'completed'
  );

  const getStatusPill = (status: 'not_started' | 'in_progress' | 'completed') => {
    if (status === 'completed') {
      return (
        <span className="px-3 py-1 text-xs font-bold leading-none rounded-full bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    if (status === 'in_progress') {
        return <span className="px-3 py-1 text-xs font-bold leading-none text-yellow-800 bg-yellow-100 rounded-full">In Progress</span>;
    }
    return <span className="px-3 py-1 text-xs font-bold leading-none text-slate-600 bg-slate-200 rounded-full">Not Started</span>;
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map(quiz => {
          const progress = quizProgress[quiz.id];
          if (!progress) return null;
          const isCompleted = progress.status === 'completed';

          return (
            <div key={quiz.id} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col transition-all duration-300 hover:border-indigo-300 hover:shadow-md">
              <div className="flex-grow flex items-center gap-4">
                <TopicIcon categoryId={quiz.id} />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{quiz.name}</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {progress.total} Questions
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                {getStatusPill(progress.status)}
                <button
                  onClick={() => onStartQuiz(quiz.id)}
                  disabled={isCompleted}
                  className={`px-6 py-2 text-white font-semibold rounded-lg text-sm transition-all duration-200 transform shadow-sm flex items-center gap-2 ${
                    isCompleted 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 hover:scale-105'
                  }`}
                >
                  {isCompleted ? 'Completed' : 'Start'}
                   {!isCompleted && <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>}
                </button>
              </div>
            </div>
          );
        })}
      
        {allQuizzesCompleted && (
          <div className="md:col-span-2 mt-2">
            <div className="text-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="flex justify-center mb-4">
                 <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">All Quizzes Completed!</h3>
              <p className="text-slate-500 mt-2 mb-6 max-w-md mx-auto">You're ready to generate your final training report to submit for review.</p>
              <button
                onClick={onGenerateReport}
                className="w-full max-w-xs mx-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                 <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHub;