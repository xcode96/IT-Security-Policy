import React, { useState, useEffect, useMemo } from 'react';
import { TrainingReport } from '../types';
import { QUIZZES } from '../constants';

const PASSING_PERCENTAGE = 70;

const AdminDashboard: React.FC = () => {
    const [reports, setReports] = useState<TrainingReport[]>([]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [copiedReportId, setCopiedReportId] = useState<string | null>(null);

    const API_BASE = 'https://iso27001-pnrp.onrender.com/api/reports';

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(API_BASE);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const serverReports: TrainingReport[] = await response.json();
                setReports(serverReports.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
            } catch (error) {
                console.error("Failed to fetch reports from server, loading from local storage:", error);
                // Fallback to local storage
                const savedReportsRaw = localStorage.getItem('trainingReports');
                const savedReports: TrainingReport[] = savedReportsRaw ? JSON.parse(savedReportsRaw) : [];
                setReports(savedReports.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
            }
        };

        fetchReports();
    }, []);

    const handleClearReports = async () => {
        if (window.confirm("Are you sure you want to clear all submitted reports? This action cannot be undone.")) {
            try {
                const response = await fetch(API_BASE, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Server-side deletion failed.');
                }
                // If server deletion is successful, clear local state and storage
                localStorage.removeItem('trainingReports');
                setReports([]);
                setSelectedReportId(null);
                alert('All reports have been cleared.');
            } catch (error) {
                console.error("Failed to clear reports from server:", error);
                alert("Could not clear reports from the server. Please check the connection and try again. Note: Local fallback reports can be cleared by clearing browser data.");
            }
        }
    };
    
    const handleShareReport = (report: TrainingReport) => {
        const date = new Date(report.submissionDate).toLocaleDateString();
        
        let reportString = `Subject: Training Report — ${report.user.fullName} — ${date}\n\n`;
        reportString += `Administrator,\n\n`;
        reportString += `Please find the training results for ${report.user.fullName} (Employee ID: ${report.user.username}) on ${date}:\n\n`;
        reportString += `Overall result: ${report.overallResult ? 'Pass' : 'Fail'}\n\n`;
        reportString += `--- DETAILED BREAKDOWN ---\n\n`;

        QUIZZES.forEach(quiz => {
            const progress = report.quizProgress[quiz.id];
            if (!progress) return;

            const percentage = progress.total > 0 ? Math.round((progress.score / progress.total) * 100) : 0;
            const passed = percentage >= PASSING_PERCENTAGE;

            reportString += `Quiz: ${quiz.name}\n`;
            reportString += `Result: ${passed ? 'Pass' : 'Fail'} (${progress.score}/${progress.total} - ${percentage}%)\n`;

            if (!passed) {
                const incorrectAnswers = progress.userAnswers.filter(a => !a.isCorrect);
                const weaknesses = [...new Set(incorrectAnswers.map(a => a.questionText))];
                if (weaknesses.length > 0) {
                    reportString += `Areas of Weakness:\n`;
                    weaknesses.forEach(weakness => {
                        reportString += `- ${weakness}\n`;
                    });
                }
            }
            reportString += `\n`;
        });
        
        navigator.clipboard.writeText(reportString).then(() => {
            setCopiedReportId(report.id);
            setTimeout(() => setCopiedReportId(null), 2000);
        });
    };

    const selectedReport = useMemo(() => {
        if (!selectedReportId) return null;
        return reports.find(r => r.id === selectedReportId);
    }, [selectedReportId, reports]);
    
    const ReportDetailView = ({ report }: { report: TrainingReport }) => {
      const reportData = useMemo(() => {
          return QUIZZES.map(quiz => {
              const progress = report.quizProgress[quiz.id];
              // Handle cases where a quiz might not have progress data
              if (!progress) {
                  return {
                      name: quiz.name,
                      score: 0,
                      total: 0,
                      percentage: 0,
                      passed: false,
                      weaknesses: ['Quiz not taken'],
                  };
              }
              const percentage = progress.total > 0 ? Math.round((progress.score / progress.total) * 100) : 0;
              const passed = percentage >= PASSING_PERCENTAGE;

              let weaknesses: string[] = [];
              if (!passed) {
                  const incorrectAnswers = progress.userAnswers.filter(a => !a.isCorrect);
                  weaknesses = [...new Set(incorrectAnswers.map(a => a.questionText))];
              }

              return {
                  name: quiz.name,
                  score: progress.score,
                  total: progress.total,
                  percentage,
                  passed,
                  weaknesses,
              };
          });
      }, [report]);

      return (
        <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="text-lg font-bold mb-2 text-slate-900">Detailed Results</h3>
            <div className="space-y-3">
                {reportData.map(result => (
                    <div key={result.name} className="border border-slate-200 rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800">{result.name}</h4>
                                <p className="text-sm text-slate-500">Score: {result.score} / {result.total} ({result.percentage}%)</p>
                            </div>
                            <p className={`font-bold text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {result.passed ? 'Pass' : 'Fail'}
                            </p>
                        </div>
                        {!result.passed && result.weaknesses.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                                <p className="text-xs font-semibold text-slate-600">Areas of weakness:</p>
                                <ul className="list-disc list-inside text-xs text-red-600 mt-1 space-y-1">
                                    {result.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Submitted Reports ({reports.length})</h2>
                <button
                    onClick={handleClearReports}
                    disabled={reports.length === 0}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Clear All Reports
                </button>
            </div>
            {reports.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-900">No reports submitted</h3>
                    <p className="mt-1 text-sm text-slate-500">As users complete their training, reports will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map(report => (
                        <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-200 transition-shadow hover:shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div className="mb-3 sm:mb-0">
                                    <h3 className="font-bold text-slate-800 text-lg">{report.user.fullName} <span className="text-slate-500 font-normal">(ID: {report.user.username})</span></h3>
                                    <p className="text-slate-500 text-sm">
                                        Submitted on: {new Date(report.submissionDate).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                                    <span className={`px-3 py-1 text-xs font-bold leading-none rounded-full w-20 text-center ${
                                        report.overallResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {report.overallResult ? 'Pass' : 'Fail'}
                                    </span>
                                    <button
                                        onClick={() => handleShareReport(report)}
                                        className={`px-5 py-2 text-white font-semibold rounded-lg text-sm transition-all duration-200 transform shadow-sm w-full sm:w-auto ${copiedReportId === report.id ? 'bg-green-500' : 'bg-slate-600 hover:bg-slate-700'}`}
                                    >
                                        {copiedReportId === report.id ? 'Copied!' : 'Share Report'}
                                    </button>
                                    <button
                                        onClick={() => setSelectedReportId(selectedReportId === report.id ? null : report.id)}
                                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-transform duration-200 transform hover:scale-105 shadow-sm shadow-indigo-500/10 w-full sm:w-auto"
                                    >
                                        {selectedReportId === report.id ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                            </div>
                            {selectedReportId === report.id && selectedReport && <ReportDetailView report={selectedReport} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;