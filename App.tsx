import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { QUIZZES as INITIAL_QUIZZES } from './constants';
import { Question, QuizProgress, TrainingReport, Quiz, User, AdminUser } from './types';
import QuestionCard from './components/QuestionCard';
import ResultsCard from './components/ResultsCard';
import QuizHub from './components/QuizHub';
import UserLogin from './components/UserInfo';
import ReportCard from './components/ReportCard';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import PostSubmissionCard from './components/PostSubmissionCard';

type View = 'user_login' | 'quiz_hub' | 'quiz_running' | 'quiz_finished' | 'report' | 'post_submission';

const App: React.FC = () => {
  const [view, setView] = useState<View>('user_login');
  const [user, setUser] = useState<{ fullName: string, username: string } | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loggedInAdmin, setLoggedInAdmin] = useState<AdminUser | null>(null);
  const [finalOverallResult, setFinalOverallResult] = useState<boolean | null>(null);

  // Effect for Admin User initialization
  useEffect(() => {
    let savedAdmins: AdminUser[] = [];
    try {
        const savedAdminsRaw = localStorage.getItem('app_admins');
        if (savedAdminsRaw) {
            const parsedData = JSON.parse(savedAdminsRaw);
            if (Array.isArray(parsedData)) {
                savedAdmins = parsedData;
            }
        }
    } catch (error) {
        console.error("Could not parse admins from localStorage.", error);
    }

    const superAdminExists = savedAdmins.some(u => u.username.toLowerCase() === 'superadmin');
    if (!superAdminExists) {
        savedAdmins.push({ username: 'superadmin', password: 'dq.adm', role: 'super' });
    }
    
    localStorage.setItem('app_admins', JSON.stringify(savedAdmins));
    setAdminUsers(savedAdmins);
  }, []);

  // Effect to load and sanitize user data from localStorage on initial load.
  useEffect(() => {
    let savedUsers: User[] = [];
    try {
        const savedUsersRaw = localStorage.getItem('app_users');
        if (savedUsersRaw) {
            const parsedData = JSON.parse(savedUsersRaw);
            if (Array.isArray(parsedData)) {
                savedUsers = parsedData;
            }
        }
    } catch (error) {
        console.error("Could not parse users from localStorage. Resetting.", error);
        localStorage.removeItem('app_users');
    }

    savedUsers = savedUsers.map(u => ({ 
        ...u, 
        username: u.username ? u.username.trim() : '',
        fullName: u.fullName ? u.fullName.trim() : '',
        status: u.status || 'active' 
    })).filter(u => u.username);

    const defaultUserExists = savedUsers.some(u => u.username.toLowerCase() === 'demo');
    if (!defaultUserExists) {
        savedUsers.push({ fullName: 'Demo User', username: 'Demo', password: 'Demo', status: 'active' });
    }
    
    savedUsers = savedUsers.filter(u => u.username !== 'sso.user' && u.username !== 'main');

    localStorage.setItem('app_users', JSON.stringify(savedUsers));
    setUsers(savedUsers);
  }, []);

  const initialProgress = useMemo(() => {
    const progress: QuizProgress = {};
    quizzes.forEach(quiz => {
      progress[quiz.id] = { status: 'not_started', score: 0, total: quiz.questions.length, userAnswers: [] };
    });
    return progress;
  }, [quizzes]);

  const [quizProgress, setQuizProgress] = useState<QuizProgress>(initialProgress);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const isAdminView = useMemo(() => new URLSearchParams(window.location.search).get('page') === 'admin', []);

  const handleAdminLogin = (username: string, password: string): { success: boolean, message: string } => {
    const adminFound = adminUsers.find(
      (admin) => admin.username.toLowerCase() === username.toLowerCase() && admin.password === password
    );
    if (adminFound) {
      setLoggedInAdmin(adminFound);
      return { success: true, message: '' };
    }
    return { success: false, message: 'Invalid admin username or password.' };
  };
  
  const handleUserLogin = useCallback((username: string, password: string): { success: boolean, message: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const userFound = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (userFound) {
      if (userFound.password !== password) {
        return { success: false, message: 'Invalid Username or password.' };
      }
      if (userFound.status === 'expired') {
        return { success: false, message: 'This account has already completed the training and is inactive. Please contact an administrator for a retake.' };
      }
      setUser({ fullName: userFound.fullName, username: userFound.username });
      setView('quiz_hub');
      setQuizProgress(initialProgress);
      return { success: true, message: '' };
    }
    return { success: false, message: 'Invalid Username or password.' };
  }, [users, initialProgress]);

  const handleStartQuiz = useCallback((quizId: string) => {
    setQuizProgress(prev => ({
      ...prev,
      [quizId]: { ...prev[quizId], status: 'in_progress', score: 0, userAnswers: [] }
    }));
    setActiveQuizId(quizId);
    setCurrentQuestionIndex(0);
    setView('quiz_running');
  }, []);
  
  const activeQuiz = useMemo(() => {
    if (!activeQuizId) return null;
    return quizzes.find(q => q.id === activeQuizId);
  }, [activeQuizId, quizzes]);

  const handleAnswer = useCallback((question: Question, isCorrect: boolean) => {
    if (!activeQuizId) return;
    if (isCorrect) {
      setQuizProgress(prev => ({
        ...prev,
        [activeQuizId]: {
          ...prev[activeQuizId],
          score: prev[activeQuizId].score + 1,
        }
      }));
    }
    setQuizProgress(prev => ({
      ...prev,
      [activeQuizId]: {
        ...prev[activeQuizId],
        userAnswers: [...prev[activeQuizId].userAnswers, {
          questionId: question.id,
          isCorrect,
          questionText: question.question,
        }],
      }
    }));
  }, [activeQuizId]);

  const handleNext = useCallback(() => {
    if (!activeQuiz) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < activeQuiz.questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setQuizProgress(prev => ({
        ...prev,
        [activeQuiz.id]: { ...prev[activeQuiz.id], status: 'completed' }
      }));
      setView('quiz_finished');
    }
  }, [currentQuestionIndex, activeQuiz]);

  const handleReturnToHub = useCallback(() => {
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setView('quiz_hub');
  }, []);
  
  const handleGenerateReport = useCallback(() => {
    setView('report');
  }, []);

  const handleSubmitReport = useCallback(async (reportData: TrainingReport): Promise<boolean> => {
    const API_BASE = 'https://iso27001-pnrp.onrender.com/api/reports';
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData),
        });
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        // --- SUCCESS PATH ---
        setFinalOverallResult(reportData.overallResult);

        if (user) {
            const updatedUsers = users.map(u => 
                u.username.toLowerCase() === user.username.toLowerCase() ? { ...u, status: 'expired' as const } : u
            );
            setUsers(updatedUsers);
            localStorage.setItem('app_users', JSON.stringify(updatedUsers));
        }
        setView('post_submission');
        return true;

    } catch (error) {
        console.error("Failed to submit report to server:", error);
        alert("There was an unexpected error submitting your report. Please check your internet connection and try again.");
        return false;
    }
  }, [user, users]);

  const handleRestartTraining = useCallback(() => {
    setQuizProgress(initialProgress);
    setUser(null);
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setFinalOverallResult(null);
    setView('user_login');
  }, [initialProgress]);
  
  const handleUpdateRequestStatus = (username: string, status: 'active' | 'expired') => {
    const updatedUsers = users.map(u => 
        u.username.toLowerCase() === username.toLowerCase() ? { ...u, status } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
  };

  const handleAddQuestion = (quizId: string, question: Omit<Question, 'id'>) => {
    setQuizzes(prevQuizzes => {
        return prevQuizzes.map(quiz => {
            if (quiz.id === quizId) {
                const newQuestion: Question = { ...question, id: Date.now() };
                return { ...quiz, questions: [...quiz.questions, newQuestion] };
            }
            return quiz;
        });
    });
  };
  
  const handleAddUser = (newUser: Omit<User, 'status'>): boolean => {
    const cleanUser = {
        fullName: newUser.fullName.trim(),
        username: newUser.username.trim(),
        password: newUser.password,
    };

    if (users.some(u => u.username.toLowerCase() === cleanUser.username.toLowerCase())) {
        alert('Username already exists.');
        return false;
    }
    
    const userToAdd: User = { ...cleanUser, status: 'active' };
    const updatedUsers = [...users, userToAdd];
    setUsers(updatedUsers);
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    return true;
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    if (usernameToDelete.toLowerCase() === 'demo') {
        alert("The default Demo user cannot be deleted.");
        return;
    }
    const updatedUsers = users.filter(user => user.username !== usernameToDelete);
    setUsers(updatedUsers);
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
  };

  const handleAddAdmin = (newAdmin: AdminUser): boolean => {
    if (adminUsers.some(admin => admin.username.toLowerCase() === newAdmin.username.toLowerCase())) {
      alert('Admin username already exists.');
      return false;
    }
    const updatedAdmins = [...adminUsers, newAdmin];
    setAdminUsers(updatedAdmins);
    localStorage.setItem('app_admins', JSON.stringify(updatedAdmins));
    return true;
  };

  const handleDeleteAdmin = (usernameToDelete: string) => {
    if (usernameToDelete.toLowerCase() === 'superadmin') {
      alert('The Super Admin account cannot be deleted.');
      return;
    }
    const updatedAdmins = adminUsers.filter(admin => admin.username !== usernameToDelete);
    setAdminUsers(updatedAdmins);
    localStorage.setItem('app_admins', JSON.stringify(updatedAdmins));
  };

  const handleImportQuizzes = (newQuizzes: Quiz[]) => {
    if (Array.isArray(newQuizzes) && newQuizzes.every(q => q.id && q.name && Array.isArray(q.questions))) {
        setQuizzes(newQuizzes);
        alert('Quizzes imported successfully!');
    } else {
        alert('Invalid quiz file format.');
    }
  };

  if (isAdminView) {
    if (!loggedInAdmin) return <AdminLogin onLogin={handleAdminLogin} />;
    return <AdminPanel 
              quizzes={quizzes}
              users={users}
              adminUsers={adminUsers}
              admin={loggedInAdmin}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onAddQuestion={handleAddQuestion}
              onImportQuizzes={handleImportQuizzes}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onAddAdmin={handleAddAdmin}
              onDeleteAdmin={handleDeleteAdmin}
           />;
  }

  const renderContent = () => {
    switch(view) {
      case 'quiz_hub':
        if(!user) return null;
        return <QuizHub 
                  user={user}
                  quizzes={quizzes}
                  quizProgress={quizProgress} 
                  onStartQuiz={handleStartQuiz} 
                  onGenerateReport={handleGenerateReport}
                />;
      case 'quiz_running':
        if (!activeQuiz || activeQuiz.questions.length === 0) {
          return (
            <div className="p-8 text-center animate-fade-in bg-slate-800/50 rounded-2xl">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Error Loading Quiz</h2>
                <p className="text-slate-400 mb-6">The selected quiz could not be found. Please return to the dashboard and try again.</p>
                <button 
                    onClick={handleReturnToHub} 
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold rounded-lg transition-transform duration-200 transform hover:scale-105"
                >
                    Return to Dashboard
                </button>
            </div>
          );
        }
        return (
            <QuestionCard
              question={activeQuiz.questions[currentQuestionIndex]}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={activeQuiz.questions.length}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
        );
      case 'quiz_finished':
        return <ResultsCard onReturnToHub={handleReturnToHub} />;
      case 'report':
        if (!user) return null;
        return (
          <ReportCard 
            user={user}
            quizProgress={quizProgress}
            quizzes={quizzes}
            onSubmitReport={handleSubmitReport}
          />
        );
      case 'post_submission':
        if (finalOverallResult === null) return null;
        return <PostSubmissionCard user={user} overallResult={finalOverallResult} onLogout={handleRestartTraining} />;
      default:
        return null;
    }
  };
  
  if (view === 'user_login') {
    return (
       <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
        <UserLogin onLogin={handleUserLogin} />
      </div>
    );
  }
  
  if (view === 'quiz_running') {
    return (
       <div className="min-h-screen w-full font-sans bg-slate-900 flex items-center justify-center p-4">
         <main className="w-full max-w-3xl">
          {renderContent()}
         </main>
       </div>
    );
  }

  if (view === 'quiz_finished') {
    return (
       <div className="min-h-screen w-full font-sans bg-slate-900 flex items-center justify-center p-4">
         <main className="w-full max-w-lg">
           <div className="transition-all duration-500 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm">
             {renderContent()}
           </div>
         </main>
       </div>
    );
  }
  
  if (view === 'report' || view === 'post_submission') {
    return (
       <div className="min-h-screen w-full font-sans bg-slate-900 flex items-center justify-center p-4">
         <main className="w-full max-w-2xl">
           <div className="transition-all duration-500 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm">
             {renderContent()}
           </div>
         </main>
       </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans bg-slate-900">
      <main className="w-full max-w-5xl mx-auto px-4 pb-12 pt-12">
        <div className="transition-all duration-500 min-h-[450px] bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;