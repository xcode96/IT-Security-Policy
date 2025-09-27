import React, { useMemo, useState, useEffect } from 'react';
import { QuizProgress, TrainingReport, Quiz } from '../types';

interface ReportCardProps {
  user: { fullName: string, username: string };
  quizProgress: QuizProgress;
  quizzes: Quiz[];
  onSubmitReport: (report: TrainingReport) => void;
  onRestart: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ user, quizProgress, quizzes, onSubmitReport, onRestart }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const overallResult = useMemo(() => {
    let totalScore = 0;
    let totalQuestions = 0;
    const PASSING_PERCENTAGE = 70;

    const allCompleted = quizzes.every(quiz => quizProgress[quiz.id]?.status === 'completed');
    if (!allCompleted) return false;

    quizzes.forEach(quiz => {
      const progress = quizProgress[quiz.id];
      if (progress) {
        totalScore += progress.score;
        totalQuestions += progress.total;
      }
    });
    
    if (totalQuestions === 0) return false;

    const overallPercentage = (totalScore / totalQuestions) * 100;
    return overallPercentage >= PASSING_PERCENTAGE;
  }, [quizProgress, quizzes]);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onRestart();
      }, 3000); // Auto-logout after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, onRestart]);

  const handleSubmit = () => {
    const report: TrainingReport = {
        id: `${user.username}-${Date.now()}`,
        user,
        quizProgress,
        overallResult: overallResult,
        submissionDate: new Date().toISOString(),
    };
    onSubmitReport(report);
    setIsSubmitted(true);
  };
  
  const SubmissionIcon = () => (
    <svg className="w-16 h-16 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
    </svg>
  );

  return (
    <div className="p-6 md:p-8 animate-fade-in text-center">
      
       {isSubmitted ? (
         <>
          <div className="flex justify-center mb-4">
             <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Submission Successful</h2>
          <p className="text-slate-400 text-lg mb-8">Your training record has been sent. You will be logged out shortly.</p>
          <div className="w-full max-w-xs mx-auto bg-slate-700 rounded-full h-1.5 mt-4">
            <div className="bg-blue-500 h-1.5 rounded-full animate-progress-bar"></div>
          </div>
           <style>{`
            @keyframes progress-bar-animation {
              from { width: 0%; }
              to { width: 100%; }
            }
            .animate-progress-bar {
              animation: progress-bar-animation 3s linear forwards;
            }
          `}</style>
         </>
       ) : (
         <>
            <div className="flex justify-center mb-4">
                <SubmissionIcon />
            </div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Training Complete</h2>
            <p className="text-slate-400 text-lg mb-4">
                Congratulations, <span className="font-bold text-slate-200">{user.fullName}</span>! You have completed all modules.
            </p>
            <p className="text-slate-400 text-md mb-8 max-w-lg mx-auto">
              Please submit your report to finalize the process. Your results will be sent to the administrator for review.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto text-center px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md shadow-blue-500/20"
                >
                    Submit Report & Log Out
                </button>
            </div>
         </>
       )}
    </div>
  );
};

export default ReportCard;