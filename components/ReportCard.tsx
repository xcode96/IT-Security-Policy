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
    return quizzes.every(quiz => {
      const progress = quizProgress[quiz.id];
      if (!progress || progress.status !== 'completed') return false;
      const percentage = progress.total > 0 ? (progress.score / progress.total) * 100 : 0;
      return percentage >= PASSING_PERCENTAGE;
    });
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
             <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 text-lg mb-8">Thank you. The administrator has received your training report.</p>
          <button
            onClick={onRestart}
            className="w-full mt-4 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
          >
            Start New Training
          </button>
         </>
       ) : (
         <>
            <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Training Complete</h2>
            <p className="text-gray-600 text-lg mb-8">
                You have completed all required quizzes. Please submit your report to the administrator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onRestart}
                    className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-lg transition-colors duration-200"
                >
                    Restart Training
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-full sm:flex-1 text-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
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
