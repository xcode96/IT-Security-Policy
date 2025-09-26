import React, { useState, useMemo, useRef } from 'react';
import { Question, Topic } from '../types';
import { TOPICS } from '../constants';

interface AdminPanelProps {
  questions: Question[];
  onAddQuestion: (question: Omit<Question, 'id' | 'topicName'>) => void;
  onSetQuestions: (questions: Question[]) => void;
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ questions, onAddQuestion, onSetQuestions, onExit }) => {
  const [topicId, setTopicId] = useState<Topic>(TOPICS[0].id);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const validOptions = useMemo(() => options.filter(opt => opt.trim() !== ''), [options]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() === '' || validOptions.length < 2 || correctAnswer.trim() === '' || !validOptions.includes(correctAnswer)) {
      alert('Please fill out all fields. You must provide at least 2 options and select a valid correct answer.');
      return;
    }

    onAddQuestion({
      topicId,
      question,
      options: validOptions,
      correctAnswer,
    });
    
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'questions.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') throw new Error("File is not readable");
            const parsedQuestions = JSON.parse(result);
            if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => 'question' in q && 'options' in q)) {
                onSetQuestions(parsedQuestions);
            } else {
                throw new Error("Invalid question format in JSON file.");
            }
        } catch (error) {
            alert(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Reset file input value to allow re-uploading the same file
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsText(file);
  };


  const commonInputClasses = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-6 text-center text-sm">
        <p><strong>Note:</strong> Changes made here are for the current session only. Use Export/Import to save and load your work.</p>
      </div>
      
      <div className="border-b border-gray-200 mb-6 pb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Data Management</h2>
         <div className="flex gap-4">
            <button onClick={handleImportClick} className="flex-1 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-lg transition-colors duration-200">Import from JSON</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <button onClick={handleExport} className="flex-1 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-lg transition-colors duration-200">Export to JSON</button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6">Add a New Question</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-600 mb-2">Topic</label>
          <select
            id="topic"
            value={topicId}
            onChange={(e) => setTopicId(Number(e.target.value) as Topic)}
            className={commonInputClasses}
          >
            {TOPICS.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-600 mb-2">Question</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className={commonInputClasses}
            rows={3}
            placeholder="What is the capital of..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Options</label>
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className={commonInputClasses}
            />
          ))}
        </div>
        <div>
          <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-600 mb-2">Correct Answer</label>
          <select
            id="correctAnswer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className={commonInputClasses}
            disabled={validOptions.length === 0}
          >
            <option value="">Select the correct answer...</option>
            {validOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-center pt-4">
            <button
                type="button"
                onClick={onExit}
                className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-lg transition-colors duration-200"
            >
                Back to Quiz
            </button>
            <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-md"
            >
                Add Question
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;
