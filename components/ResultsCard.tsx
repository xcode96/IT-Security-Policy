import React, { useMemo } from 'react';
import { UserAnswer } from '../types';
import { TOPICS } from '../constants';
import TopicIcon from './TopicIcon';

interface ResultsCardProps {
  score: number;
  totalQuestions: number;
  userAnswers: UserAnswer[];
  onRestart: () => void;
}

const PASSING_PERCENTAGE = 70;

const ResultsCard: React.FC<ResultsCardProps> = ({ score, totalQuestions, userAnswers, onRestart }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassed = percentage >= PASSING_PERCENTAGE;

  const weakestTopic = useMemo(() => {
    if (userAnswers.length === 0) return null;

    const topicStats: { [key: number]: { incorrect: number; total: number } } = {};

    userAnswers.forEach(answer => {
      if (!topicStats[answer.topicId]) {
        topicStats[answer.topicId] = { incorrect: 0, total: 0 };
      }
      topicStats[answer.topicId].total++;
      if (!answer.isCorrect) {
        topicStats[answer.topicId].incorrect++;
      }
    });

    let weakestTopicId = -1;
    let maxErrorRate = -1;

    for (const topicId in topicStats) {
      const stats = topicStats[topicId];
      if (stats.incorrect > 0) {
        const errorRate = stats.incorrect / stats.total;
        if (errorRate > maxErrorRate) {
          maxErrorRate = errorRate;
          weakestTopicId = Number(topicId);
        }
      }
    }

    if (weakestTopicId === -1) return null; // All correct

    const topicInfo = TOPICS.find(t => t.id === weakestTopicId);
    return topicInfo;

  }, [userAnswers]);


  const PassIcon = () => (
    <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const FailIcon = () => (
     <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
     </svg>
  );

  return (
    <div className="text-center p-6 md:p-8 animate-fade-in">
      <div className="flex justify-center mb-4">
        {isPassed ? <PassIcon /> : <FailIcon />}
      </div>
      
      <h2 className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'} mb-2`}>
        {isPassed ? 'Quiz Passed!' : 'Quiz Failed'}
      </h2>

      <p className="text-gray-600 text-lg mb-4">You scored {score} out of {totalQuestions} ({percentage}%)</p>

      {weakestTopic ? (
        <div className="bg-gray-100 rounded-xl p-4 my-6 text-left">
          <h3 className="font-bold text-gray-800 text-md mb-3 text-center">Area for Improvement</h3>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <TopicIcon topicId={weakestTopic.id} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{weakestTopic.name}</p>
              <p className="text-sm text-gray-500">Consider reviewing the materials for this topic.</p>
            </div>
          </div>
        </div>
      ) : (
         <div className="bg-green-50 border-green-200 border rounded-xl p-4 my-6 text-center">
            <p className="font-semibold text-green-700">Excellent work! No weak areas found.</p>
         </div>
      )}

      <button
        onClick={onRestart}
        className="w-full mt-4 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
      >
        Try Again
      </button>
    </div>
  );
};

export default ResultsCard;
