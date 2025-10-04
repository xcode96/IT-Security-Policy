import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AdminPanelProps, Question, Quiz, User, RetakeRequest, AdminUser, AdminRole } from '../types';
import { useToast } from './ToastProvider';
import AdminDashboard from './AdminDashboard';

type Tab = 'reports' | 'requests' | 'users' | 'questions' | 'admins';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    quizzes, users, adminUsers, admin,
    onAddUser, onDeleteUser, onAddQuestion, onEditQuestion, onDeleteQuestion,
    onImportQuizzes, onUpdateRequestStatus, onAddAdmin, onDeleteAdmin 
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('reports');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();
    
    // State for searches
    const [userSearch, setUserSearch] = useState('');
    const [retakeSearch, setRetakeSearch] = useState('');
    const [adminSearch, setAdminSearch] = useState('');
    const [questionSearch, setQuestionSearch] = useState('');
    
    const [retakeRequests, setRetakeRequests] = useState<RetakeRequest[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<{ quizId: string; question: Question } | null>(null);
    
    const canEdit = admin.role === 'super' || admin.role === 'editor';
    const isSuperAdmin = admin.role === 'super';

    useEffect(() => {
        const savedRequestsRaw = localStorage.getItem('retakeRequests');
        if (savedRequestsRaw) {
            const savedRequests: RetakeRequest[] = JSON.parse(savedRequestsRaw);
            setRetakeRequests(savedRequests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
        }
    }, []);

    const [newQuestion, setNewQuestion] = useState({
        quizId: quizzes[0]?.id || '', question: '', options: ['', '', '', ''], correctAnswer: '',
    });
    const [newUser, setNewUser] = useState({ fullName: '', username: '', password: '' });
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'viewer' as AdminRole });
    const [showUserPass, setShowUserPass] = useState(false);
    const [showAdminPass, setShowAdminPass] = useState(false);


    const updateRetakeRequests = (updatedRequests: RetakeRequest[]) => {
        setRetakeRequests(updatedRequests);
        localStorage.setItem('retakeRequests', JSON.stringify(updatedRequests));
    };

    // CSV Export Helpers
    const escapeCsvField = (field: string | null | undefined): string => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    const downloadCsv = (headers: string[], data: any[][], filename: string) => {
        if (data.length === 0) {
            toast.info(`There is no data to export in the current view for ${filename}.`);
            return;
        }
        const csvRows = [
            headers.join(','),
            ...data.map(row => row.map(escapeCsvField).join(','))
        ];
        const csvContent = csvRows.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const ExportButton: React.FC<{ onClick: () => void, disabled?: boolean }> = ({ onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-sm transition-colors duration-200 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex-shrink-0 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>
            Export
        </button>
    );
    
    const EyeIcon = ({ visible }: { visible: boolean }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          {visible ? ( <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /> ) : ( <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></> )}
        </svg>
    );

    const handleApproveRetake = async (username: string) => {
        await onUpdateRequestStatus(username, 'active');
        const updatedRequests = retakeRequests.filter(req => req.username !== username);
        updateRetakeRequests(updatedRequests);
        toast.success(`User ${username} approved for a retake.`);
    };

    const handleDenyRetake = (username: string) => {
        if (window.confirm(`Are you sure you want to deny the retake request for "${username}"?`)) {
            const updatedRequests = retakeRequests.filter(req => req.username !== username);
            updateRetakeRequests(updatedRequests);
            toast.info(`Retake request for ${username} denied.`);
        }
    };
    
    const handleAddUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, username, password } = newUser;
        if (!fullName || !username || !password) { toast.error('Please fill out all user fields.'); return; }
        const success = onAddUser({ fullName, username, password });
        if (success) setNewUser({ fullName: '', username: '', password: '' });
    };
    
    const handleAddQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { quizId, question, options, correctAnswer } = newQuestion;
        if (!quizId || !question || options.some(o => !o.trim()) || !correctAnswer) { toast.error("Please fill out all fields."); return; }
        const selectedQuiz = quizzes.find(q => q.id === quizId);
        if (!selectedQuiz) { toast.error("Selected quiz category not found."); return; }
        const questionToAdd: Omit<Question, 'id'> = { category: selectedQuiz.name, question, options, correctAnswer };
        onAddQuestion(quizId, questionToAdd);
        setNewQuestion({ quizId: quizId, question: '', options: ['', '', '', ''], correctAnswer: '' });
        toast.success("Question added successfully!");
    };

    const handleAddAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.username || !newAdmin.password) { toast.error('Please fill out all admin fields.'); return; }
        const success = onAddAdmin(newAdmin);
        if (success) setNewAdmin({ username: '', password: '', role: 'viewer' });
    };

    const handleEditQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingQuestion) return;
        
        const { quizId, question } = editingQuestion;
        if (!question.question || question.options.some(o => !o.trim()) || !question.correctAnswer) {
            toast.error("Please fill out all fields.");
            return;
        }
        onEditQuestion(quizId, question);
        toast.success("Question updated successfully!");
        setEditingQuestion(null);
    };
    
    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(quizzes, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString; link.download = "quizzes.json"; link.click();
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
                onImportQuizzes(JSON.parse(text));
            } catch (error) {
                console.error("Failed to import quizzes:", error);
                toast.error("Failed to import quizzes. Check file format.");
            }
        };
        reader.readAsText(file);
    };

    const allQuestions = useMemo(() => {
        return quizzes.flatMap(quiz => quiz.questions.map(question => ({ ...question, quizId: quiz.id, quizName: quiz.name })));
    }, [quizzes]);

    const filteredQuestions = useMemo(() => {
        const searchTerm = questionSearch.toLowerCase().trim();
        if (!searchTerm) return allQuestions;
        return allQuestions.filter(q => 
            q.question.toLowerCase().includes(searchTerm) ||
            q.category.toLowerCase().includes(searchTerm)
        );
    }, [allQuestions, questionSearch]);

    const filteredRetakeRequests = useMemo(() => {
        const searchTerm = retakeSearch.toLowerCase().trim();
        if (!searchTerm) return retakeRequests;
        return retakeRequests.filter(req => req.fullName.toLowerCase().includes(searchTerm) || req.username.toLowerCase().includes(searchTerm));
    }, [retakeRequests, retakeSearch]);

    const filteredUsers = useMemo(() => {
        const searchTerm = userSearch.toLowerCase().trim();
        if (!searchTerm) return users;
        return users.filter(user => user.fullName.toLowerCase().includes(searchTerm) || user.username.toLowerCase().includes(searchTerm));
    }, [users, userSearch]);
    
    const filteredAdmins = useMemo(() => {
        const searchTerm = adminSearch.toLowerCase().trim();
        if (!searchTerm) return adminUsers;
        return adminUsers.filter(admin => admin.username.toLowerCase().includes(searchTerm));
    }, [adminUsers, adminSearch]);

    const commonInputClasses = "w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed";
    const NavLink = ({ tab, icon, children, visible = true }: {tab: Tab, icon: React.ReactNode, children: React.ReactNode, visible?: boolean }) => (
        visible ? <button onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-500/10 text-blue-300' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
            {icon}
            <span>{children}</span>
        </button> : null
    );

    const getHeader = () => {
        switch(activeTab) {
            case 'reports': return { title: 'User Reports', subtitle: 'Review and manage submitted training reports.' };
            case 'requests': return { title: 'Retake Requests', subtitle: 'Approve or deny user requests to retake the exam.' };
            case 'users': return { title: 'User Management', subtitle: 'Add or remove user accounts.' };
            case 'questions': return { title: 'Question Management', subtitle: 'Manage quiz content and data workflow.' };
            case 'admins': return { title: 'Admin Management', subtitle: 'Create and manage administrator accounts.' };
        }
    }

    return (
        <div className="flex min-h-screen w-full font-sans bg-slate-900 text-slate-200">
            {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            
            {/* Edit Question Modal */}
            {editingQuestion && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setEditingQuestion(null)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleEditQuestionSubmit} className="space-y-4">
                            <div className="p-6 border-b border-slate-700">
                                <h3 className="text-xl font-bold text-slate-100">Edit Question</h3>
                                <p className="text-sm text-slate-400">Category: {editingQuestion.question.category}</p>
                            </div>
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                <div><label className="block text-sm font-medium text-slate-300 mb-1">Question Text</label><textarea value={editingQuestion.question.question} onChange={(e) => setEditingQuestion(p => p ? { ...p, question: { ...p.question, question: e.target.value } } : null)} rows={3} className={commonInputClasses} required /></div>
                                {editingQuestion.question.options.map((option, index) => (
                                    <div key={index}><label className="block text-sm font-medium text-slate-300 mb-1">Option {index + 1}</label><input type="text" value={option} onChange={(e) => {
                                        const newOptions = [...editingQuestion.question.options]; newOptions[index] = e.target.value;
                                        setEditingQuestion(p => p ? { ...p, question: { ...p.question, options: newOptions } } : null);
                                    }} className={commonInputClasses} required /></div>
                                ))}
                                <div><label className="block text-sm font-medium text-slate-300 mb-1">Correct Answer</label><select value={editingQuestion.question.correctAnswer} onChange={(e) => setEditingQuestion(p => p ? { ...p, question: { ...p.question, correctAnswer: e.target.value } } : null)} className={commonInputClasses} required><option value="">Select the correct answer</option>{editingQuestion.question.options.filter(o => o.trim()).map(option => <option key={option} value={option}>{option}</option>)}</select></div>
                            </div>
                            <div className="p-6 border-t border-slate-700 flex justify-end gap-4 bg-slate-900/40 rounded-b-2xl">
                                <button type="button" onClick={() => setEditingQuestion(null)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 bg-slate-800/80 backdrop-blur-lg p-4 border-r border-slate-700 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg border border-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-100">Admin Panel</h1>
                </div>
                <nav className="flex flex-col gap-2">
                    {/* FIX: Explicitly passing children as a prop to work around a potential JSX parsing issue. */}
                    <NavLink tab="reports" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.5 2.75A.75.75 0 002.75 3.5v13.5A.75.75 0 003.5 18h13a.75.75 0 00.75-.75V8.162a.75.75 0 00-.22-.53l-5.06-5.06A.75.75 0 0011.84 2H3.5A.75.75 0 002.75 3.5V2.75zm6.56 2.5l4.69 4.69H11.25a1 1 0 01-1-1V5.25z" /></svg>} children="User Reports" />
                    {/* FIX: Explicitly passing children as a prop to work around a potential JSX parsing issue. */}
                     <NavLink tab="requests" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201-4.42 5.5 5.5 0 011.166-1.023l.526-1.053a.75.75 0 011.45.042l.206 1.03a6.959 6.959 0 01-1.287 5.965 5.5 5.5 0 01-1.263 1.023A3.489 3.489 0 006.5 14.5a3.5 3.5 0 005.474 2.651.75.75 0 11-1.3-1.3A2 2 0 018.5 14.5a2 2 0 012.288-1.884l.526-1.053a.75.75 0 011.45.042l.206 1.03a5.5 5.5 0 01-1.637 4.144z" clipRule="evenodd" /></svg>} children={<>
                        Retake Requests
                        {retakeRequests.length > 0 && (
                            <span className="ml-auto bg-amber-500 text-slate-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{retakeRequests.length}</span>
                        )}
                    </>} />
                    {/* FIX: Explicitly passing children as a prop to work around a potential JSX parsing issue. */}
                    <NavLink tab="users" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" /></svg>} children="User Management" />
                    {/* FIX: Explicitly passing children as a prop to work around a potential JSX parsing issue. */}
                    <NavLink tab="questions" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M15.28 4.72a.75.75 0 010 1.06l-6.5 6.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06L8.5 10.69l6.02-6.03a.75.75 0 011.06 0zm-7.03 8.22a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM15.28 9.72a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>} children="Question Management" />
                    {/* FIX: Explicitly passing children as a prop to work around a potential JSX parsing issue. */}
                    <NavLink tab="admins" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" /></svg>} visible={isSuperAdmin} children="Admin Management" />
                </nav>
            </aside>
            
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                 <header className="mb-8 flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                        <span className="sr-only">Open menu</span>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100">{getHeader().title}</h2>
                        <p className="text-slate-400 mt-1">{getHeader().subtitle}</p>
                    </div>
                </header>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm p-4 md:p-8">
                    {activeTab === 'reports' && <AdminDashboard />}

                    {activeTab === 'requests' && (
                        <div className="animate-fade-in">
                            {retakeRequests.length === 0 ? (
                                <div className="text-center py-12"><svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25s-9-3.694-9-8.25c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg><h3 className="mt-2 text-lg font-medium text-slate-200">No Pending Requests</h3><p className="mt-1 text-sm text-slate-400">When a user fails and requests a retake, it will appear here.</p></div>
                            ) : (
                                <><div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
                                  <input type="text" placeholder="Search requests..." value={retakeSearch} onChange={(e) => setRetakeSearch(e.target.value)} className={`${commonInputClasses} w-full sm:w-auto flex-grow`} />
                                  <ExportButton onClick={() => downloadCsv(['Full Name', 'Username', 'Request Date'], filteredRetakeRequests.map(r => [r.fullName, r.username, r.requestDate]), 'retake_requests')} disabled={filteredRetakeRequests.length === 0} />
                                </div><div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">{filteredRetakeRequests.length === 0 ? <p className="text-slate-400 text-center py-4">No requests match your search.</p> : filteredRetakeRequests.map(req => (<div key={req.username} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4"><div><p className="font-semibold text-slate-200">{req.fullName}</p><p className="text-sm text-slate-400 font-mono">Username: {req.username}</p><p className="text-xs text-slate-500 mt-1">Requested: {new Date(req.requestDate).toLocaleString()}</p></div><div className="flex items-center gap-3 w-full sm:w-auto"><button onClick={() => handleDenyRetake(req.username)} disabled={!canEdit} className="flex-1 sm:flex-none px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Deny</button><button onClick={() => handleApproveRetake(req.username)} disabled={!canEdit} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Approve</button></div></div>))}</div></>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'users' && (
                        <div className="animate-fade-in"><div className="grid grid-cols-1 xl:grid-cols-2 gap-8"><div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700"><h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3 text-slate-100">Add New User</h3><form onSubmit={handleAddUserSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label><input type="text" name="fullName" value={newUser.fullName} onChange={(e) => setNewUser(p => ({...p, fullName: e.target.value}))} className={commonInputClasses} placeholder="e.g., Jane Doe" required disabled={!canEdit}/></div><div><label className="block text-sm font-medium text-slate-300 mb-1">Username</label><input type="text" name="username" value={newUser.username} onChange={(e) => setNewUser(p => ({...p, username: e.target.value}))} className={commonInputClasses} placeholder="e.g., jdoe99" required disabled={!canEdit}/></div><div className="relative"><label className="block text-sm font-medium text-slate-300 mb-1">Password</label><input type={showUserPass ? 'text' : 'password'} name="password" value={newUser.password} onChange={(e) => setNewUser(p => ({...p, password: e.target.value}))} className={`${commonInputClasses} pr-10`} placeholder="Set a temporary password" required disabled={!canEdit}/><button type="button" onClick={() => setShowUserPass(!showUserPass)} className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-200 transition-colors"><EyeIcon visible={!showUserPass} /></button></div><button type="submit" disabled={!canEdit} className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">Add User</button></form></div><div><div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b border-slate-700 pb-3 gap-4"><h3 className="text-xl font-bold text-slate-100">Existing Users ({filteredUsers.length})</h3><ExportButton onClick={() => downloadCsv(['Full Name', 'Username', 'Status'], filteredUsers.map(u => [u.fullName, u.username, u.status]), 'user_management')} disabled={filteredUsers.length === 0} /></div><div className="mb-4"><input type="text" placeholder="Search by name or username..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className={commonInputClasses} /></div><div className="space-y-3 max-h-[26rem] overflow-y-auto pr-2">{users.length === 0 ? <p className="text-slate-400 text-center py-4">No users have been added.</p> : filteredUsers.length === 0 ? <p className="text-slate-400 text-center py-4">No users match your search.</p> : filteredUsers.map(user => (<div key={user.username} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center text-center sm:text-left gap-2"><div><p className="font-semibold text-slate-200">{user.fullName}</p><p className="text-sm text-slate-400 font-mono">Username: {user.username}</p><p className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${user.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>{user.status}</p></div>{user.username.toLowerCase() !== 'demo' && canEdit && (<button onClick={() => { if (window.confirm(`Are you sure you want to delete the user "${user.username}"?`)) { onDeleteUser(user.username); } }} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" aria-label={`Delete user ${user.username}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>)}</div>))}</div></div></div></div>
                    )}

                    {activeTab === 'questions' && (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700">
                                    <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3 text-slate-100">Add New Question</h3>
                                    <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
                                        {/* ... Form content for adding questions ... */}
                                        <div><label className="block text-sm font-medium text-slate-300 mb-1">Category</label><select name="quizId" value={newQuestion.quizId} onChange={(e) => setNewQuestion(p => ({ ...p, quizId: e.target.value }))} className={commonInputClasses} disabled={!canEdit}>{quizzes.map(quiz => <option key={quiz.id} value={quiz.id}>{quiz.name}</option>)}</select></div><div><label className="block text-sm font-medium text-slate-300 mb-1">Question Text</label><textarea name="question" value={newQuestion.question} onChange={(e) => setNewQuestion(p => ({ ...p, question: e.target.value }))} rows={3} className={commonInputClasses} required disabled={!canEdit}/></div>{newQuestion.options.map((option, index) => (<div key={index}><label className="block text-sm font-medium text-slate-300 mb-1">Option {index + 1}</label><input type="text" value={option} onChange={(e) => { const newOptions = [...newQuestion.options]; newOptions[index] = e.target.value; setNewQuestion(p => ({...p, options: newOptions})); }} className={commonInputClasses} required disabled={!canEdit}/></div>))}<div><label className="block text-sm font-medium text-slate-300 mb-1">Correct Answer</label><select name="correctAnswer" value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion(p => ({ ...p, correctAnswer: e.target.value }))} className={commonInputClasses} required disabled={!canEdit}><option value="">Select the correct answer</option>{newQuestion.options.filter(o => o.trim()).map(option => <option key={option} value={option}>{option}</option>)}</select></div><button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={!canEdit}>Add Question</button>
                                    </form>
                                </div>
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b border-slate-700 pb-3 gap-4">
                                        <h3 className="text-xl font-bold text-slate-100">Existing Questions ({filteredQuestions.length})</h3>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                        <input type="text" placeholder="Search questions..." value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} className={`${commonInputClasses} w-full`} />
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button onClick={handleExport} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-sm transition-colors flex-shrink-0">Export</button>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" /><button onClick={handleImportClick} disabled={!canEdit} className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-sm transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed flex-shrink-0">Import</button>
                                        </div>
                                    </div>
                                    <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
                                        {filteredQuestions.length === 0 ? <p className="text-slate-400 text-center py-4">No questions match your search.</p> : filteredQuestions.map(q => (
                                            <div key={q.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                <p className="font-semibold text-slate-200 text-sm truncate">{q.question}</p>
                                                <p className="text-xs text-slate-400 mt-1 font-mono">{q.category}</p>
                                                {canEdit && <div className="flex items-center gap-2 mt-2">
                                                    <button onClick={() => setEditingQuestion({ quizId: q.quizId, question: q })} className="px-3 py-1 text-xs font-bold rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200">Edit</button>
                                                    <button onClick={() => { if (window.confirm(`Are you sure you want to delete this question?`)) { onDeleteQuestion(q.quizId, q.id); toast.success('Question deleted.'); } }} className="px-3 py-1 text-xs font-bold rounded-md bg-red-900/50 hover:bg-red-900 text-red-400">Delete</button>
                                                </div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admins' && isSuperAdmin && (
                        <div className="animate-fade-in"><div className="grid grid-cols-1 xl:grid-cols-2 gap-8"><div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700"><h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3 text-slate-100">Add New Admin</h3><form onSubmit={handleAddAdminSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-slate-300 mb-1">Username</label><input type="text" value={newAdmin.username} onChange={(e) => setNewAdmin(p=>({...p, username: e.target.value}))} className={commonInputClasses} required /></div><div className="relative"><label className="block text-sm font-medium text-slate-300 mb-1">Password</label><input type={showAdminPass ? 'text' : 'password'} value={newAdmin.password} onChange={(e) => setNewAdmin(p=>({...p, password: e.target.value}))} className={`${commonInputClasses} pr-10`} required /><button type="button" onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-200 transition-colors"><EyeIcon visible={!showAdminPass} /></button></div><div><label className="block text-sm font-medium text-slate-300 mb-1">Role</label><select value={newAdmin.role} onChange={(e) => setNewAdmin(p=>({...p, role: e.target.value as AdminRole}))} className={commonInputClasses}><option value="viewer">Viewer (Read-only)</option><option value="editor">Editor</option></select></div><button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Add Admin</button></form></div><div><div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b border-slate-700 pb-3 gap-4"><h3 className="text-xl font-bold text-slate-100">Existing Admins ({filteredAdmins.length})</h3><ExportButton onClick={() => downloadCsv(['Username', 'Role'], filteredAdmins.map(a => [a.username, a.role]), 'admin_management')} disabled={filteredAdmins.length === 0} /></div><div className="mb-4"><input type="text" placeholder="Search by username..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className={commonInputClasses} /></div><div className="space-y-3 max-h-[26rem] overflow-y-auto pr-2">{adminUsers.map(adm => (<div key={adm.username} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center text-center sm:text-left gap-2"><div><p className="font-semibold text-slate-200">{adm.username}</p><p className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${adm.role === 'super' ? 'bg-amber-500/10 text-amber-400' : adm.role === 'editor' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>{adm.role}</p></div>{adm.role !== 'super' && (<button onClick={() => {if (window.confirm(`Are you sure you want to delete the admin "${adm.username}"?`)) { onDeleteAdmin(adm.username); }}} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" aria-label={`Delete admin ${adm.username}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>)}</div>))}</div></div></div></div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;