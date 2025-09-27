import React, { useMemo, useState } from 'react';
import { QuizProgress, TrainingReport, Quiz } from '../types';
import { PASSING_PERCENTAGE } from '../constants';

interface ReportCardProps {
  user: { fullName: string, username: string };
  quizProgress: QuizProgress;
  quizzes: Quiz[];
  onSubmitReport: (report: TrainingReport) => Promise<boolean>;
}

const ReportCard: React.FC<ReportCardProps> = ({ user, quizProgress, quizzes, onSubmitReport }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const overallResult = useMemo(() => {
    let totalScore = 0;
    let totalQuestions = 0;

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


  const handleSubmit = async () => {
    setIsSubmitting(true);
    const report: TrainingReport = {
        id: `${user.username}-${Date.now()}`,
        user,
        quizProgress,
        overallResult: overallResult,
        submissionDate: new Date().toISOString(),
    };
    const success = await onSubmitReport(report);
    if (!success) {
      setIsSubmitting(false);
    }
  };
  
  const SubmissionIcon = () => (
    <svg className="w-16 h-16 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
    </svg>
  );

  return (
    <div className="p-6 md:p-8 animate-fade-in text-center">
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
              disabled={isSubmitting}
              className="w-full sm:w-auto text-center px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md shadow-blue-500/20 flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Report'
              )}
          </button>
      </div>
    </div>
  );
};

export default ReportCard;