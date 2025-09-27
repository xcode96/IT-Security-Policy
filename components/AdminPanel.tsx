import React, { useState, useRef, useMemo } from 'react';
import { AdminPanelProps, Question, Quiz, User } from '../types';
import AdminDashboard from './AdminDashboard';

type Tab = 'reports' | 'users' | 'questions';

const AdminPanel: React.FC<AdminPanelProps> = ({ quizzes, users, onAddUser, onDeleteUser, onAddQuestion, onImportQuizzes }) => {
    const [activeTab, setActiveTab] = useState<Tab>('reports');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userSearch, setUserSearch] = useState('');

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

    const filteredUsers = useMemo(() => {
        const searchTerm = userSearch.toLowerCase().trim();
        if (!searchTerm) return users;
        return users.filter(user =>
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm)
        );
    }, [users, userSearch]);

    const commonInputClasses = "w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
    const NavLink = ({ tab, icon, children }: {tab: Tab, icon: React.ReactNode, children: React.ReactNode}) => (
        <button onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-500/10 text-blue-300' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
            {icon}
            <span>{children}</span>
        </button>
    );

    const getHeader = () => {
        switch(activeTab) {
            case 'reports': return { title: 'User Reports', subtitle: 'Review and manage submitted training reports.' };
            case 'users': return { title: 'User Management', subtitle: 'Add or remove user accounts.' };
            case 'questions': return { title: 'Question Management', subtitle: 'Manage quiz content and data workflow.' };
        }
    }

    return (
        <div className="flex min-h-screen w-full font-sans bg-slate-900 text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-slate-800/50 p-4 border-r border-slate-700 flex flex-col">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg border border-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">Admin Panel</h1>
                </div>
                <nav className="flex flex-col gap-2">
                    <NavLink tab="reports" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.5 2.75A.75.75 0 002.75 3.5v13.5A.75.75 0 003.5 18h13a.75.75 0 00.75-.75V8.162a.75.75 0 00-.22-.53l-5.06-5.06A.75.75 0 0011.84 2H3.5A.75.75 0 002.75 3.5V2.75zm6.56 2.5l4.69 4.69H11.25a1 1 0 01-1-1V5.25z" /></svg>}>
                        User Reports
                    </NavLink>
                    <NavLink tab="users" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" /></svg>}>
                        User Management
                    </NavLink>
                    <NavLink tab="questions" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M15.28 4.72a.75.75 0 010 1.06l-6.5 6.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06L8.5 10.69l6.02-6.03a.75.75 0 011.06 0zm-7.03 8.22a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM15.28 9.72a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>}>
                        Question Management
                    </NavLink>
                </nav>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-100">{getHeader().title}</h2>
                    <p className="text-slate-400 mt-1">{getHeader().subtitle}</p>
                </header>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm p-6 md:p-8">
                    {activeTab === 'reports' && <AdminDashboard />}
                    
                    {activeTab === 'users' && (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700">
                                    <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3 text-slate-100">Add New User</h3>
                                    <form onSubmit={handleAddUserSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                                            <input type="text" name="fullName" value={newUser.fullName} onChange={handleNewUserChange} className={commonInputClasses} placeholder="e.g., Jane Doe" required/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Employee ID</label>
                                            <input type="text" name="username" value={newUser.username} onChange={handleNewUserChange} className={commonInputClasses} placeholder="e.g., jdoe99" required/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                            <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} className={commonInputClasses} placeholder="Set a temporary password" required/>
                                        </div>
                                        <button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Add User</button>
                                    </form>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3 text-slate-100">Existing Users ({filteredUsers.length})</h3>
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search by name or ID..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className={commonInputClasses}
                                        />
                                    </div>
                                    <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-2">
                                        {users.length === 0 ? (
                                            <p className="text-slate-400 text-center py-4">No users have been added.</p>
                                        ) : filteredUsers.length === 0 ? (
                                            <p className="text-slate-400 text-center py-4">No users match your search.</p>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <div key={user.username} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-slate-200">{user.fullName}</p>
                                                        <p className="text-sm text-slate-400 font-mono">ID: {user.username}</p>
                                                        <p className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${user.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
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
                                                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                                            aria-label={`Delete user ${user.username}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'questions' && (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                               <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700">
                                    <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3 text-slate-100">Add New Question</h3>
                                    <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                            <select name="quizId" value={newQuestion.quizId} onChange={handleInputChange} className={commonInputClasses}>
                                                {quizzes.map(quiz => <option key={quiz.id} value={quiz.id}>{quiz.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Question Text</label>
                                            <textarea name="question" value={newQuestion.question} onChange={handleInputChange} rows={3} className={commonInputClasses} required/>
                                        </div>
                                        {newQuestion.options.map((option, index) => (
                                            <div key={index}>
                                                <label className="block text-sm font-medium text-slate-300 mb-1">Option {index + 1}</label>
                                                <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className={commonInputClasses} required/>
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Correct Answer</label>
                                            <select name="correctAnswer" value={newQuestion.correctAnswer} onChange={handleInputChange} className={commonInputClasses} required>
                                                <option value="">Select the correct answer</option>
                                                {newQuestion.options.filter(o => o.trim()).map(option => <option key={option} value={option}>{option}</option>)}
                                            </select>
                                        </div>
                                        <button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Add Question</button>
                                    </form>
                                </div>
                                
                                <div className="space-y-8">
                                     <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700">
                                         <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3 text-slate-100">Data Management</h3>
                                         <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <button onClick={handleExport} className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg">Export to JSON</button>
                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                                                <button onClick={handleImportClick} className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg">Import from JSON</button>
                                            </div>
                                         </div>
                                     </div>
                                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg">
                                        <h3 className="font-bold text-lg mb-1 text-blue-200">How to Update the Live Quiz</h3>
                                        <p className="text-sm">
                                            This panel is for preparing quiz updates. To make changes permanent for all users, you must:
                                            <br/> 1. <strong>Export to JSON</strong> after adding your new questions.
                                            <br/> 2. Replace the content of the <strong>`constants.ts`</strong> file with data from the exported file.
                                            <br/> 3. <strong>Deploy the updated code</strong> to the live server.
                                        </p>
                                      </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;