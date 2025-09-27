import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { QUIZZES as INITIAL_QUIZZES } from './constants';
import { Question, QuizProgress, TrainingReport, Quiz, User } from './types';
import QuestionCard from './components/QuestionCard';
import ResultsCard from './components/ResultsCard';
import QuizHub from './components/QuizHub';
import UserLogin from './components/UserInfo';
import ReportCard from './components/ReportCard';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

type View = 'user_login' | 'quiz_hub' | 'quiz_running' | 'quiz_finished' | 'report';

const App: React.FC = () => {
  const [view, setView] = useState<View>('user_login');
  const [user, setUser] = useState<{ fullName: string, username: string } | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Effect to load and sanitize user data from localStorage on initial load.
  // This ensures data integrity and handles cases of corrupted or outdated data from previous sessions.
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
        localStorage.removeItem('app_users'); // Clear corrupted data
    }

    // Sanitize all loaded users to ensure data integrity
    savedUsers = savedUsers.map(u => ({ 
        ...u, 
        username: u.username ? u.username.trim() : '',
        fullName: u.fullName ? u.fullName.trim() : '',
        status: u.status || 'active' 
    })).filter(u => u.username); // Remove any users that became invalid after trim

    // Ensure the default 'Demo' user exists
    const defaultUserExists = savedUsers.some(u => u.username.toLowerCase() === 'demo');
    if (!defaultUserExists) {
        savedUsers.push({ fullName: 'Demo User', username: 'Demo', password: 'Demo', status: 'active' });
    }
    
    // Clean up old, unused default users if they exist
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

  const handleAdminLogin = (password: string) => {
    if (password === 'dq.adm') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };
  
  const handleUserLogin = useCallback((username: string, password: string): { success: boolean, message: string } => {
    const cleanUsername = username.trim().toLowerCase(); // Sanitize input and make case-insensitive
    const userFound = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (userFound) {
      if (userFound.password !== password) {
        return { success: false, message: 'Invalid Employee ID or password.' };
      }
      if (userFound.status === 'expired') {
        return { success: false, message: 'This account has already completed the training and is inactive.' };
      }
      setUser({ fullName: userFound.fullName, username: userFound.username });
      setView('quiz_hub');
      return { success: true, message: '' };
    }
    return { success: false, message: 'Invalid Employee ID or password.' };
  }, [users]);


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

  // Handles report submission. First, it tries to POST to the API.
  // If the API call fails, it gracefully falls back to saving the report in localStorage.
  const handleSubmitReport = useCallback(async (reportData: TrainingReport) => {
    const API_BASE = 'https://iso27001-pnrp.onrender.com/api/reports';
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData),
        });
        if (!response.ok) throw new Error('Network response was not ok');
    } catch (error) {
        console.error("Failed to submit report to server, saving locally:", error);
        const savedReportsRaw = localStorage.getItem('trainingReports');
        const savedReports: TrainingReport[] = savedReportsRaw ? JSON.parse(savedReportsRaw) : [];
        savedReports.push(reportData);
        localStorage.setItem('trainingReports', JSON.stringify(savedReports));
    }
    
    // Expire user after submission
    if (user) {
        const updatedUsers = users.map(u => 
            u.username.toLowerCase() === user.username.toLowerCase() ? { ...u, status: 'expired' as const } : u
        );
        setUsers(updatedUsers);
        localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    }
  }, [user, users]);

  const handleRestartTraining = useCallback(() => {
    setQuizProgress(initialProgress);
    setUser(null);
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setView('user_login');
  }, [initialProgress]);

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
        alert('Employee ID already exists.');
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

  const handleImportQuizzes = (newQuizzes: Quiz[]) => {
    if (Array.isArray(newQuizzes) && newQuizzes.every(q => q.id && q.name && Array.isArray(q.questions))) {
        setQuizzes(newQuizzes);
        alert('Quizzes imported successfully!');
    } else {
        alert('Invalid quiz file format.');
    }
  };

  if (isAdminView) {
    if (!isAdminAuthenticated) return <AdminLogin onLogin={handleAdminLogin} />;
    return <AdminPanel 
              quizzes={quizzes}
              users={users}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onAddQuestion={handleAddQuestion}
              onImportQuizzes={handleImportQuizzes}
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
            onRestart={handleRestartTraining}
          />
        );
      default:
        return null;
    }
  };
  
  const getHeaderText = () => {
    if(view === 'report') return 'Completion Report';
    if(view === 'quiz_finished' && activeQuiz) return activeQuiz.name;
    if(activeQuiz) return activeQuiz.name;
    return 'IT Security Policy';
  };
  
  const getHeaderSubtext = () => {
    if(view === 'report') return 'Submit your report to finalize the process.';
    if(view === 'quiz_running') return 'Test your knowledge on essential security practices.';
    if(view === 'quiz_finished') return 'Your results for this module have been saved.';
    return 'An interactive quiz to test and improve knowledge on core IT security policies.';
  }

  // Special layout for user login
  if (view === 'user_login') {
    return (
       <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
        <UserLogin onLogin={handleUserLogin} />
      </div>
    );
  }
  
  // Special layout for quiz running (distraction-free mode)
  if (view === 'quiz_running') {
    return (
       <div className="min-h-screen w-full font-sans bg-slate-900 flex items-center justify-center p-4">
         <main className="w-full max-w-3xl">
          {renderContent()}
         </main>
       </div>
    );
  }

  // Default layout for dashboard, results, and report pages
  return (
    <div className="min-h-screen w-full font-sans bg-slate-900">
      {view !== 'quiz_hub' && (
        <header className="w-full pt-8 pb-12 px-4 bg-slate-900/50 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-blue-400">{getHeaderText()}</h1>
            <p className="text-lg text-slate-400 mt-4">
              {getHeaderSubtext()}
            </p>
          </div>
        </header>
      )}
      <main className={`w-full max-w-5xl mx-auto px-4 pb-12 ${view !== 'quiz_hub' ? '-mt-8' : 'pt-12'}`}>
        <div className="transition-all duration-500 min-h-[450px] bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;