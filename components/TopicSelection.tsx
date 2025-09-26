import React from 'react';
import { TOPICS } from '../constants';
import { Topic } from '../types';
import TopicIcon from './TopicIcon';

interface TopicSelectionProps {
  onStartQuiz: (topicId: Topic | null) => void;
}

const TopicSelection: React.FC<TopicSelectionProps> = ({ onStartQuiz }) => {
  return (
    <div className="p-6 md:p-8 animate-fade-in text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose a Topic</h2>
      <p className="text-gray-500 mb-8">Select a specific category or test your knowledge on all topics.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {TOPICS.map(({ id, name }) => (
          <button
            key={id}
            onClick={() => onStartQuiz(id)}
            className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center aspect-square"
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
               <TopicIcon topicId={id} />
            </div>
            <span className="mt-3 text-center text-sm font-semibold text-gray-700">{name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => onStartQuiz(null)}
        className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
      >
        Start Quiz with All Topics
      </button>
    </div>
  );
};

export default TopicSelection;