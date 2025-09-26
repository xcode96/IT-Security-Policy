import React from 'react';
import { QuizProgress, Quiz } from '../types';
import TopicIcon from './TopicIcon';

interface QuizHubProps {
  quizzes: Quiz[];
  quizProgress: QuizProgress;
  onStartQuiz: (quizId: string) => void;
  onGenerateReport: () => void;
}

const QuizHub: React.FC<QuizHubProps> = ({ quizzes, quizProgress, onStartQuiz, onGenerateReport }) => {

  const allQuizzesCompleted = Object.values(quizProgress).every(
    (quiz) => quiz.status === 'completed'
  );

  const getStatusPill = (status: 'not_started' | 'in_progress' | 'completed') => {
    if (status === 'completed') {
      return (
        <span className="px-3 py-1 text-xs font-bold leading-none rounded-full bg-blue-100 text-blue-800">
          Completed
        </span>
      );
    }
    if (status === 'in_progress') {
        return <span className="px-3 py-1 text-xs font-bold leading-none text-yellow-800 bg-yellow-100 rounded-full">In Progress</span>;
    }
    return <span className="px-3 py-1 text-xs font-bold leading-none text-gray-800 bg-gray-100 rounded-full">Not started</span>;
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="space-y-4">
        {quizzes.map(quiz => {
          const progress = quizProgress[quiz.id];
          if (!progress) return null; // Handle case where progress might not be initialized yet
          const isCompleted = progress.status === 'completed';

          return (
            <div key={quiz.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4">
                <TopicIcon categoryId={quiz.id} />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{quiz.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {progress.total} Questions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusPill(progress.status)}
                <button
                  onClick={() => onStartQuiz(quiz.id)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-transform duration-200 transform hover:scale-105 shadow-sm"
                >
                  {isCompleted ? 'Retake' : 'Start'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {allQuizzesCompleted && (
        <div className="mt-8 text-center">
          <p className="text-green-700 font-semibold mb-4">Great job! You have completed all quizzes.</p>
          <button
            onClick={onGenerateReport}
            className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
          >
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizHub;
