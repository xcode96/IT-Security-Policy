import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (question: Question, isCorrect: boolean) => void;
  onNext: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, onNext }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [question]);

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer) return;

    const correct = option === question.correctAnswer;
    setSelectedAnswer(option);
    onAnswer(question, correct);
    
    setTimeout(() => {
        onNext();
    }, 500);
  };

  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return 'bg-white border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700';
    }
    if (option === selectedAnswer) {
        return 'bg-blue-600 border-blue-600 text-white scale-105 shadow-lg shadow-blue-500/20';
    }
    return 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{question.category}</p>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mt-1">{question.question}</h2>
      </div>
      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelectAnswer(option)}
            disabled={selectedAnswer !== null}
            className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex justify-between items-center border ${getButtonClass(option)}`}
          >
            <span className="text-md font-medium">{option}</span>
            {selectedAnswer === option && (
                <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;