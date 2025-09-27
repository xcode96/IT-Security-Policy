import React, { useState, useRef } from 'react';
import { AdminPanelProps, Question, Quiz } from '../types';
import AdminDashboard from './AdminDashboard';

const AdminPanel: React.FC<AdminPanelProps> = ({ quizzes, users, onAddUser, onDeleteUser, onAddQuestion, onImportQuizzes }) => {
    const [activeTab, setActiveTab] = useState<'reports' | 'questions' | 'users'>('reports');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newQuestion, setNewQuestion] = useState({
        quizId: quizzes[0]?.id || '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
    });

    const [newUser, setNewUser] = useState({
        fullName: '',
        username: '',
        password: '',
    });
    
    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, username, password } = newUser;

        if (!fullName || !username || !password) {
            alert('Please fill out all user fields.');
            return;
        }
        const success = onAddUser({ fullName, username, password });
        if (success) setNewUser({ fullName: '', username: '', password: '' });
    };
    
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
        
        setNewQuestion({
            quizId: quizId,
            question: '',
            options: ['', '', '', ''],
            correctAnswer: '',
        });
        alert("Question added successfully!");
    };
    
    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(quizzes, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "quizzes.json";
        link.click();
    };

    const handleImportClick = () => fileInputRef.current?.click();

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

    const commonInputClasses = "w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
    
    return (
        <div className="min-h-screen w-full font-sans text-slate-900 bg-slate-100">
            <header className="w-full pt-12 pb-8 px-4 border-b border-slate-200 bg-white">
                <div className="text-center max-w-6xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">Administrator Panel</h1>
                    <p className="text-lg text-slate-500">Manage quizzes, users, and review reports.</p>
                </div>
            </header>
            <main className="w-full max-w-6xl mx-auto px-4 py-12">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                    <div className="border-b border-slate-200">
                        <nav className="flex space-x-1 p-2" aria-label="Tabs">
                            <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                                User Reports
                            </button>
                            <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'questions' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                                Question Management
                            </button>
                             <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                                User Management
                            </button>
                        </nav>
                    </div>
                    <div className="p-6 md:p-8">
                        {activeTab === 'reports' && <AdminDashboard />}
                        
                        {activeTab === 'users' && (
                            <div className="animate-fade-in">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                        <h2 className="text-xl font-bold mb-4 border-b border-slate-200 pb-2 text-slate-900">Add New User</h2>
                                        <form onSubmit={handleAddUserSubmit} className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-600 mt-2">USER DETAILS</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                                <input type="text" name="fullName" value={newUser.fullName} onChange={handleNewUserChange} className={commonInputClasses} placeholder="e.g., Jane Doe" required/>
                                            </div>
                                             <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                                                <input type="text" name="username" value={newUser.username} onChange={handleNewUserChange} className={commonInputClasses} placeholder="e.g., jdoe99" required/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                                <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} className={commonInputClasses} placeholder="Set a temporary password" required/>
                                            </div>
                                            <button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Add User</button>
                                        </form>
                                    </div>
                                    <div>
                                         <h2 className="text-xl font-bold mb-4 border-b border-slate-200 pb-2 text-slate-900">Existing Users ({users.length})</h2>
                                         <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-2">
                                            {users.map(user => (
                                                <div key={user.username} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{user.fullName}</p>
                                                        <p className="text-sm text-slate-500 font-mono">ID: {user.username}</p>
                                                        <p className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                                                            {user.status}
                                                        </p>
                                                    </div>
                                                    {user.username.toLowerCase() !== 'demo' && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to delete the user "${user.username}"?`)) {
                                                                    onDeleteUser(user.username);
                                                                }
                                                            }}
                                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                            aria-label={`Delete user ${user.username}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                         </div>
                                    </div>
                                 </div>
                            </div>
                        )}

                        {activeTab === 'questions' && (
                            <div className="animate-fade-in">
                                <div className="p-4 mb-6 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
                                  <h3 className="font-bold text-lg mb-1">How to Update the Live Quiz</h3>
                                  <p className="text-sm">
                                      This panel is for testing and preparing quiz updates. To make changes permanent for all users on the live site, you must:
                                      <br/> 1. <strong>Export to JSON</strong> after adding your new questions.
                                      <br/> 2. Replace the content of the <strong>`constants.ts`</strong> file in the source code with the data from the exported file.
                                      <br/> 3. <strong>Deploy the updated code</strong> to the live server (e.g., via a git push).
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                        <h2 className="text-xl font-bold mb-4 border-b border-slate-200 pb-2 text-slate-900">Add New Question</h2>
                                        <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-600 mt-2">QUESTION DETAILS</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                                <select name="quizId" value={newQuestion.quizId} onChange={handleInputChange} className={commonInputClasses}>
                                                    {quizzes.map(quiz => <option key={quiz.id} value={quiz.id}>{quiz.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                                                <textarea name="question" value={newQuestion.question} onChange={handleInputChange} rows={3} className={commonInputClasses} required/>
                                            </div>
                                            {newQuestion.options.map((option, index) => (
                                                 <div key={index}>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Option {index + 1}</label>
                                                    <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className={commonInputClasses} required/>
                                                </div>
                                            ))}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer</label>
                                                <select name="correctAnswer" value={newQuestion.correctAnswer} onChange={handleInputChange} className={commonInputClasses} required>
                                                    <option value="">Select the correct answer</option>
                                                    {newQuestion.options.filter(o => o.trim()).map(option => <option key={option} value={option}>{option}</option>)}
                                                </select>
                                            </div>
                                            <button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Add Question</button>
                                        </form>
                                    </div>
                                    <div>
                                         <h2 className="text-xl font-bold mb-4 border-b border-slate-200 pb-2 text-slate-900">Data Management</h2>
                                         <div className="space-y-4 p-6 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-4">
                                                <button onClick={handleExport} className="flex-1 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg">Export to JSON</button>
                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                                                <button onClick={handleImportClick} className="flex-1 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg border border-slate-300">Import from JSON</button>
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;