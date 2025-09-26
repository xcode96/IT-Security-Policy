import React, { useState, useCallback, useMemo } from 'react';
import { QUIZZES as INITIAL_QUIZZES } from './constants';
import { Question, QuizProgress, TrainingReport, Quiz } from './types';
import QuestionCard from './components/QuestionCard';
import ResultsCard from './components/ResultsCard';
import ProgressBar from './components/ProgressBar';
import QuizHub from './components/QuizHub';
import UserInfo from './components/UserInfo';
import ReportCard from './components/ReportCard';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

type View = 'user_info' | 'quiz_hub' | 'quiz_running' | 'quiz_finished' | 'report';

const App: React.FC = () => {
  const [view, setView] = useState<View>('user_info');
  const [user, setUser] = useState<{ fullName: string, username: string } | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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

  const handleUserSubmit = useCallback((fullName: string, username: string) => {
    setUser({ fullName, username });
    setView('quiz_hub');
  }, []);

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

  const handleSubmitReport = useCallback(async (reportData: TrainingReport) => {
    const API_BASE = 'https://iso27001-pnrp.onrender.com/api/reports';
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error("Failed to submit report to server, saving locally:", error);
        // Fallback to local storage
        const savedReportsRaw = localStorage.getItem('trainingReports');
        const savedReports: TrainingReport[] = savedReportsRaw ? JSON.parse(savedReportsRaw) : [];
        savedReports.push(reportData);
        localStorage.setItem('trainingReports', JSON.stringify(savedReports));
    }
  }, []);

  const handleRestartTraining = useCallback(() => {
    setQuizProgress(initialProgress);
    setUser(null);
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setView('user_info');
  }, [initialProgress]);

  const handleAddQuestion = (quizId: string, question: Omit<Question, 'id'>) => {
    setQuizzes(prevQuizzes => {
        return prevQuizzes.map(quiz => {
            if (quiz.id === quizId) {
                const newQuestion: Question = {
                    ...question,
                    id: Date.now(), // Simple unique ID
                };
                return { ...quiz, questions: [...quiz.questions, newQuestion] };
            }
            return quiz;
        });
    });
  };

  const handleImportQuizzes = (newQuizzes: Quiz[]) => {
    // Basic validation
    if (Array.isArray(newQuizzes) && newQuizzes.every(q => q.id && q.name && Array.isArray(q.questions))) {
        setQuizzes(newQuizzes);
        alert('Quizzes imported successfully!');
    } else {
        alert('Invalid quiz file format.');
    }
  };

  if (isAdminView) {
    if (!isAdminAuthenticated) {
        return <AdminLogin onLogin={handleAdminLogin} />;
    }
    return <AdminPanel 
              quizzes={quizzes}
              onAddQuestion={handleAddQuestion}
              onImportQuizzes={handleImportQuizzes}
           />;
  }

  const renderContent = () => {
    switch(view) {
      case 'user_info':
        return <UserInfo onSubmit={handleUserSubmit} />;
      case 'quiz_hub':
        return <QuizHub 
                  quizzes={quizzes}
                  quizProgress={quizProgress} 
                  onStartQuiz={handleStartQuiz} 
                  onGenerateReport={handleGenerateReport}
                />;
      case 'quiz_running':
        if (!activeQuiz || activeQuiz.questions.length === 0) {
          return <div className="p-8 text-center">There was an unexpected error. Finish what you were doing.</div>;
        }
        return (
          <div className="p-6 md:p-8">
            <ProgressBar current={currentQuestionIndex + 1} total={activeQuiz.questions.length} />
            <QuestionCard
              question={activeQuiz.questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
          </div>
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
    if(view === 'user_info') return 'Welcome to Your Training';
    if(view === 'quiz_hub') return 'Training Dashboard';
    if(view === 'report') return 'Training Completion';
    if(activeQuiz) return activeQuiz.name;
    return 'IT Security Training';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 tracking-tight">{getHeaderText()}</h1>
          <p className="text-lg text-gray-500">
             {view === 'user_info' && 'Please enter your details to begin.'}
             {view === 'quiz_hub' && 'Complete all quizzes to generate your report.'}
             {view === 'report' && 'Submit your report to complete the training.'}
             {view === 'quiz_running' && 'Test your knowledge on essential security practices.'}
          </p>
        </header>
        <main className="bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-500 min-h-[450px] flex flex-col justify-center">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;