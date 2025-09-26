import React, { useState, useCallback, useEffect } from 'react';
import { QUIZ_QUESTIONS, TOPICS } from './constants';
import { Question, Topic, UserAnswer } from './types';
import QuestionCard from './components/QuestionCard';
import ResultsCard from './components/ResultsCard';
import ProgressBar from './components/ProgressBar';
import TopicSelection from './components/TopicSelection';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

type View = 'topic_selection' | 'quiz_running' | 'quiz_finished' | 'admin_login' | 'admin_panel';

const App: React.FC = () => {
  const [view, setView] = useState<View>('topic_selection');
  const [questions, setQuestions] = useState<Question[]>(QUIZ_QUESTIONS);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('page') === 'admin') {
      setView('admin_login');
    }
  }, []);

  const handleAdminLogin = useCallback((password: string) => {
    if (password === 'dq.adm') {
      setIsAdmin(true);
      setView('admin_panel');
    } else {
      alert('Incorrect password.');
    }
  }, []);

  const handleAddQuestion = useCallback((newQuestionData: Omit<Question, 'id' | 'topicName'>) => {
    const topic = TOPICS.find(t => t.id === newQuestionData.topicId);
    if (!topic) {
        alert('Invalid topic selected.');
        return;
    }
    const newQuestion: Question = {
        ...newQuestionData,
        id: questions.length + 1,
        topicName: topic.name,
    };
    setQuestions(prev => [...prev, newQuestion]);
    alert('Question added successfully for this session!');
  }, [questions]);

  const handleSetQuestions = useCallback((newQuestions: Question[]) => {
    setQuestions(newQuestions);
    alert(`${newQuestions.length} questions imported successfully for this session!`);
  }, []);

  const handleExitAdmin = useCallback(() => {
    setView('topic_selection');
    window.history.pushState({}, '', window.location.pathname);
  }, []);

  const handleStartQuiz = useCallback((topicId: Topic | null) => {
    let questionsToUse;
    if (topicId) {
      questionsToUse = questions.filter(q => q.topicId === topicId);
    } else {
      questionsToUse = [...questions];
    }
    
    setActiveQuestions(questionsToUse.sort(() => Math.random() - 0.5));
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setView('quiz_running');
  }, [questions]);

  const handleAnswer = useCallback((question: Question, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setUserAnswers(prev => [...prev, {
      questionId: question.id,
      topicId: question.topicId,
      isCorrect,
    }]);
  }, []);

  const handleNext = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < activeQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setView('quiz_finished');
    }
  }, [currentQuestionIndex, activeQuestions.length]);

  const handleRestart = useCallback(() => {
    setView('topic_selection');
    setActiveQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
  }, []);

  const renderContent = () => {
    switch(view) {
      case 'admin_login':
        return <AdminLogin onLogin={handleAdminLogin} />;
      case 'admin_panel':
        return <AdminPanel 
                  questions={questions}
                  onAddQuestion={handleAddQuestion} 
                  onSetQuestions={handleSetQuestions}
                  onExit={handleExitAdmin} 
                />;
      case 'topic_selection':
        return <TopicSelection onStartQuiz={handleStartQuiz} />;
      case 'quiz_running':
        if (activeQuestions.length === 0 || !activeQuestions[currentQuestionIndex]) {
          return (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
              <p className="text-gray-500 mb-6">There are no questions for this topic yet. Add some from the admin panel!</p>
              <button onClick={handleRestart} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 hover:scale-105">Back to Topics</button>
            </div>
          );
        }
        return (
          <div className="p-6 md:p-8">
            <ProgressBar current={currentQuestionIndex + 1} total={activeQuestions.length} />
            <QuestionCard
              question={activeQuestions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
          </div>
        );
      case 'quiz_finished':
        return (
          <ResultsCard 
            score={score} 
            totalQuestions={activeQuestions.length} 
            userAnswers={userAnswers}
            onRestart={handleRestart} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 tracking-tight">IT Security Policy Quiz</h1>
          {view !== 'admin_login' && view !== 'admin_panel' &&
            <p className="text-lg text-gray-500">Test your knowledge on essential security practices.</p>
          }
           { (view === 'admin_login' || view === 'admin_panel') &&
            <p className="text-lg text-gray-500">Administrator Panel</p>
          }
        </header>
        <main className="bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-500 min-h-[450px] flex flex-col justify-center">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;