import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import ProgressBar from './ProgressBar';

interface QuestionCardProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswer: (question: Question, isCorrect: boolean) => void;
  onNext: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, currentQuestionIndex, totalQuestions, onAnswer, onNext }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [question]);

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
  };
  
  const handleNextClick = () => {
    if (!selectedAnswer) return;
    const isCorrect = selectedAnswer === question.correctAnswer;
    onAnswer(question, isCorrect);
    onNext();
  };

  const getButtonState = (option: string) => {
    if (option === selectedAnswer) {
      return { base: 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/30', text: 'text-blue-300 font-bold' };
    }
    return { base: 'bg-slate-700/50 hover:bg-slate-700 border-slate-700 hover:border-slate-600', text: 'text-slate-300' };
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl shadow-black/20 animate-fade-in w-full">
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider font-mono">{question.category}</p>
          <p className="text-sm font-medium text-slate-400 font-mono">
            Question {currentQuestionIndex + 1} / {totalQuestions}
          </p>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-tight mt-6">{question.question}</h2>
      </div>

      <div className="bg-slate-900/40 p-6 md:p-8 border-t border-slate-700 rounded-b-2xl">
        <div className="space-y-4">
          {question.options.map((option) => {
            const state = getButtonState(option);
            return (
              <button
                key={option}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex justify-between items-center border ${state.base}`}
              >
                <span className={`text-md font-medium ${state.text}`}>{option}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col items-center">
            <button
                onClick={handleNextClick}
                disabled={!selectedAnswer}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish Module' : 'Next Question'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;