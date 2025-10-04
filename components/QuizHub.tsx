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

const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
  
    return (
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
            <circle
                className="text-slate-700"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
            />
            <circle
                className="text-blue-500"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
        </svg>
        <span className="absolute text-2xl font-bold font-mono text-white">
            {`${Math.round(percentage)}%`}
        </span>
      </div>
    );
};


const QuizHub: React.FC<QuizHubProps> = ({ user, quizzes, quizProgress, onStartQuiz, onGenerateReport }) => {

  const completedQuizzes = Object.values(quizProgress).filter((p: QuizProgress[string]) => p.status === 'completed').length;
  const totalQuizzes = quizzes.length;
  const progressPercentage = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
  const allQuizzesCompleted = completedQuizzes === totalQuizzes;

  const getStatusPill = (status: 'not_started' | 'in_progress' | 'completed') => {
    if (status === 'completed') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold leading-none rounded-full bg-blue-500/10 text-blue-400">
           <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4-5.5z" clipRule="evenodd" /></svg>
          <span>Completed</span>
        </div>
      );
    }
    if (status === 'in_progress') {
        return <span className="px-3 py-1 text-xs font-bold leading-none rounded-full bg-yellow-400/10 text-yellow-400">In Progress</span>;
    }
    return <span className="px-3 py-1 text-xs font-bold leading-none rounded-full bg-slate-700 text-slate-300">Not Started</span>;
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - User Stats */}
            <div className="lg:col-span-1 bg-slate-900/40 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold text-slate-100">Welcome,</h1>
                <h2 className="text-2xl font-semibold text-blue-400 mb-6">{user.fullName}</h2>
                
                <CircularProgress percentage={progressPercentage} />

                <div className="w-full text-left mt-6 space-y-3">
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-slate-400 font-medium">Modules Completed</span>
                        <span className="font-bold font-mono text-slate-100">{completedQuizzes} / {totalQuizzes}</span>
                    </div>
                     <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-slate-400 font-medium">Modules Remaining</span>
                        <span className="font-bold font-mono text-slate-100">{totalQuizzes - completedQuizzes}</span>
                    </div>
                </div>

                {allQuizzesCompleted && (
                    <div className="mt-auto pt-6 w-full">
                         <div className="text-center p-4 bg-slate-900/30 border-2 border-dashed border-blue-500/30 rounded-xl">
                            <h3 className="text-xl font-bold text-slate-100">All Modules Done!</h3>
                            <p className="text-slate-400 mt-1 mb-4 text-sm">You're ready to generate your final report.</p>
                            <button
                                onClick={onGenerateReport}
                                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
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

            {/* Right Panel - Quiz List */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">Training Modules</h2>
                 <div className="space-y-4">
                    {quizzes.map(quiz => {
                        const progress = quizProgress[quiz.id];
                        if (!progress) return null;
                        const isCompleted = progress.status === 'completed';
                        const buttonText = isCompleted ? 'Review' : progress.status === 'in_progress' ? 'Continue' : 'Start';

                        return (
                            <div key={quiz.id} className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
                                <div className="flex items-center gap-4 w-full flex-grow">
                                    <TopicIcon categoryId={quiz.id} />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-slate-100 text-lg leading-tight">{quiz.name}</h3>
                                        <p className="text-slate-400 text-sm mt-1 font-mono">
                                            {progress.total} Questions
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto flex-shrink-0 justify-between md:justify-end mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-700 md:border-t-0">
                                    {getStatusPill(progress.status)}
                                    <button
                                        onClick={() => onStartQuiz(quiz.id)}
                                        className={`flex-1 md:flex-initial md:w-28 text-center px-5 py-2.5 font-semibold rounded-lg text-sm transition-all duration-200 transform shadow-sm flex items-center justify-center gap-2 ${
                                            isCompleted 
                                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                                            : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20 hover:scale-105'
                                        }`}
                                    >
                                        <span>{buttonText}</span>
                                        {!isCompleted && <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {!allQuizzesCompleted && (
                    <div className="mt-6 text-center text-slate-400 text-sm">
                        <p>Complete all modules to unlock your final report.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default QuizHub;