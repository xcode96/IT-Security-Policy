import React, { useState, useRef } from 'react';
import { AdminPanelProps, Question, Quiz } from '../types';
import AdminDashboard from './AdminDashboard';

const AdminPanel: React.FC<AdminPanelProps> = ({ quizzes, onAddQuestion, onImportQuizzes }) => {
    const [activeTab, setActiveTab] = useState<'reports' | 'questions'>('reports');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newQuestion, setNewQuestion] = useState({
        quizId: quizzes[0]?.id || '',
        category: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewQuestion(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion(prev => ({ ...prev, options: newOptions }));
    };

    const handleAddQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { quizId, question, options, correctAnswer } = newQuestion;
        if (!quizId || !question || options.some(o => !o.trim()) || !correctAnswer) {
            alert("Please fill out all fields.");
            return;
        }
        
        const selectedQuiz = quizzes.find(q => q.id === quizId);
        if (!selectedQuiz) {
             alert("Selected quiz category not found.");
             return;
        }

        const questionToAdd: Omit<Question, 'id'> = {
            category: selectedQuiz.name,
            question,
            options,
            correctAnswer,
        };
        onAddQuestion(quizId, questionToAdd);
        
        // Reset form
        setNewQuestion({
            quizId: quizId,
            category: '',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: '',
        });
        alert("Question added successfully!");
    };
    
    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(quizzes, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "quizzes.json";
        link.click();
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
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not valid text.");
                const importedQuizzes = JSON.parse(text);
                onImportQuizzes(importedQuizzes);
            } catch (error) {
                console.error("Failed to import quizzes:", error);
                alert("Failed to import quizzes. Please check the file format.");
            }
        };
        reader.readAsText(file);
    };

    const commonInputClasses = "w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 tracking-tight">Administrator Panel</h1>
                    <p className="text-lg text-gray-500">Manage quizzes and review user reports.</p>
                </header>
                <main className="bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-2 p-2" aria-label="Tabs">
                            <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
                                User Reports
                            </button>
                            <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'questions' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
                                Question Management
                            </button>
                        </nav>
                    </div>
                    <div className="p-6 md:p-8">
                        {activeTab === 'reports' && <AdminDashboard />}
                        {activeTab === 'questions' && (
                            <div className="animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Add Question Form */}
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Add New Question</h2>
                                        <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                                                <select name="quizId" value={newQuestion.quizId} onChange={handleInputChange} className={commonInputClasses}>
                                                    {quizzes.map(quiz => <option key={quiz.id} value={quiz.id}>{quiz.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-1">Question Text</label>
                                                <textarea name="question" value={newQuestion.question} onChange={handleInputChange} rows={3} className={commonInputClasses} />
                                            </div>
                                            {newQuestion.options.map((option, index) => (
                                                 <div key={index}>
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">Option {index + 1}</label>
                                                    <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className={commonInputClasses} />
                                                </div>
                                            ))}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-1">Correct Answer</label>
                                                <select name="correctAnswer" value={newQuestion.correctAnswer} onChange={handleInputChange} className={commonInputClasses}>
                                                    <option value="">Select the correct answer</option>
                                                    {newQuestion.options.filter(o => o.trim()).map(option => <option key={option} value={option}>{option}</option>)}
                                                </select>
                                            </div>
                                            <button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Add Question</button>
                                        </form>
                                    </div>
                                    {/* Data Management */}
                                    <div>
                                         <h2 className="text-2xl font-bold mb-4 border-b pb-2">Data Management</h2>
                                         <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                            <div>
                                                <h3 className="font-semibold text-lg">Export Quizzes</h3>
                                                <p className="text-sm text-gray-600 mb-2">Save the current set of all questions to a JSON file.</p>
                                                <button onClick={handleExport} className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">Export to JSON</button>
                                            </div>
                                            <div className="border-t pt-4">
                                                <h3 className="font-semibold text-lg">Import Quizzes</h3>
                                                <p className="text-sm text-gray-600 mb-2">Load questions from a JSON file. This will replace the current set of questions.</p>
                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                                                <button onClick={handleImportClick} className="w-full px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg">Import from JSON</button>
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
