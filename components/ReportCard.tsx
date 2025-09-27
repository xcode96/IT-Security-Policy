import React, { useMemo, useState } from 'react';
import { QuizProgress, TrainingReport, Quiz } from '../types';

interface ReportCardProps {
  user: { fullName: string, username: string };
  quizProgress: QuizProgress;
  quizzes: Quiz[];
  onSubmitReport: (report: TrainingReport) => void;
  onRestart: () => void;
}

const PASSING_PERCENTAGE = 70;

const ReportCard: React.FC<ReportCardProps> = ({ user, quizProgress, quizzes, onSubmitReport, onRestart }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const overallResult = useMemo(() => {
    let totalScore = 0;
    let totalQuestions = 0;

    // Ensure all quizzes have been completed before calculating
    const allCompleted = quizzes.every(quiz => quizProgress[quiz.id]?.status === 'completed');
    if (!allCompleted) {
        return false;
    }

    quizzes.forEach(quiz => {
      const progress = quizProgress[quiz.id];
      if (progress) {
        totalScore += progress.score;
        totalQuestions += progress.total;
      }
    });
    
    if (totalQuestions === 0) return false; // Avoid division by zero

    const overallPercentage = (totalScore / totalQuestions) * 100;
    return overallPercentage >= PASSING_PERCENTAGE;
  }, [quizProgress, quizzes]);

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

  return (
    <div className="p-6 md:p-8 animate-fade-in text-center">
      
       {isSubmitted ? (
         <>
          <div className="flex justify-center mb-4">
             <svg className="w-16 h-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
          <p className="text-slate-500 text-lg mb-8">Thank you. The administrator has received your training report.</p>
          <button
            onClick={onRestart}
            className="w-full mt-4 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-lg shadow-indigo-500/20"
          >
            Log Out
          </button>
         </>
       ) : (
         <>
            <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Training Complete</h2>
            <p className="text-slate-500 text-lg mb-8">
                You have completed all required quizzes. Please submit your report to the administrator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onRestart}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-200 border border-slate-300 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors duration-200"
                >
                    Log Out
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-full sm:flex-1 text-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md shadow-indigo-500/20"
                >
                    Submit Report to Dashboard
                </button>
            </div>
         </>
       )}
    </div>
  );
};

export default ReportCard;