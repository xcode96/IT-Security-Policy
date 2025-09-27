import React, { useState, useEffect, useMemo } from 'react';
import { TrainingReport } from '../types';
import { QUIZZES } from '../constants';
import Certificate from './Certificate';

const PASSING_PERCENTAGE = 70;

const AdminDashboard: React.FC = () => {
    const [reports, setReports] = useState<TrainingReport[]>([]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [copiedReportId, setCopiedReportId] = useState<string | null>(null);
    const [viewingCertificateFor, setViewingCertificateFor] = useState<TrainingReport | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = 'https://iso27001-pnrp.onrender.com/api/reports';

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(API_BASE);
                if (!response.ok) throw new Error('Network response was not ok');
                const serverReports: TrainingReport[] = await response.json();
                setReports(serverReports.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
            } catch (error) {
                console.error("Failed to fetch reports from server, loading from local storage:", error);
                const savedReportsRaw = localStorage.getItem('trainingReports');
                const savedReports: TrainingReport[] = savedReportsRaw ? JSON.parse(savedReportsRaw) : [];
                setReports(savedReports.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
            }
        };
        fetchReports();
    }, []);

    const filteredReports = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return reports;
        return reports.filter(report =>
            report.user.fullName.toLowerCase().includes(term) ||
            report.user.username.toLowerCase().includes(term)
        );
    }, [reports, searchTerm]);

    const handleClearReports = async () => {
        if (window.confirm("Are you sure you want to clear all submitted reports? This action cannot be undone.")) {
            try {
                const response = await fetch(API_BASE, { method: 'DELETE' });
                if (!response.ok) throw new Error('Server-side deletion failed.');
                localStorage.removeItem('trainingReports');
                setReports([]);
                setSelectedReportId(null);
                alert('All reports have been cleared.');
            } catch (error) {
                console.error("Failed to clear reports from server:", error);
                alert("Could not clear reports from the server. Note: Local fallback reports can be cleared manually via browser developer tools.");
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
                const weaknesses = [...new Set(progress.userAnswers.filter(a => !a.isCorrect).map(a => a.questionText))];
                if (weaknesses.length > 0) {
                    reportString += `Areas of Weakness:\n`;
                    weaknesses.forEach(weakness => { reportString += `- ${weakness}\n`; });
                }
            }
            reportString += `\n`;
        });
        
        navigator.clipboard.writeText(reportString).then(() => {
            setCopiedReportId(report.id);
            setTimeout(() => setCopiedReportId(null), 2000);
        });
    };

    const selectedReport = useMemo(() => reports.find(r => r.id === selectedReportId), [selectedReportId, reports]);
    
    const ReportDetailView = ({ report }: { report: TrainingReport }) => {
      const reportData = useMemo(() => {
          return QUIZZES.map(quiz => {
              const progress = report.quizProgress[quiz.id];
              if (!progress) {
                  return { name: quiz.name, score: 0, total: 0, percentage: 0, passed: false, weaknesses: ['Quiz not taken'] };
              }
              const percentage = progress.total > 0 ? Math.round((progress.score / progress.total) * 100) : 0;
              const passed = percentage >= PASSING_PERCENTAGE;
              const weaknesses = !passed ? [...new Set(progress.userAnswers.filter(a => !a.isCorrect).map(a => a.questionText))] : [];
              return { name: quiz.name, score: progress.score, total: progress.total, percentage, passed, weaknesses };
          });
      }, [report]);

      return (
        <div className="mt-4 p-4 border-t border-slate-700 bg-slate-900/30 rounded-b-xl">
            <h3 className="text-lg font-bold mb-3 text-slate-100">Detailed Results</h3>
            <div className="space-y-3">
                {reportData.map(result => (
                    <div key={result.name} className="border border-slate-700 rounded-lg p-3 bg-slate-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-200">{result.name}</h4>
                                <p className="text-sm text-slate-400">Score: {result.score} / {result.total} ({result.percentage}%)</p>
                            </div>
                            <p className={`font-bold text-sm ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.passed ? 'Pass' : 'Fail'}</p>
                        </div>
                        {result.weaknesses.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                                <p className="text-xs font-semibold text-slate-400">Areas of weakness:</p>
                                <ul className="list-disc list-inside text-xs text-red-400 mt-1 space-y-1">
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
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-slate-700 pb-4">
                 <div>
                    <h3 className="text-xl font-bold text-slate-100">All Reports ({filteredReports.length})</h3>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <button onClick={handleClearReports} disabled={reports.length === 0} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0">
                        Clear All
                    </button>
                </div>
            </div>
            {reports.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-200">No reports submitted</h3>
                    <p className="mt-1 text-sm text-slate-400">As users complete their training, reports will appear here.</p>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="text-center py-12">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-200">No Reports Found</h3>
                    <p className="mt-1 text-sm text-slate-400">Your search did not match any reports. Try different keywords.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReports.map(report => (
                        <div key={report.id} className="bg-slate-800 rounded-xl border border-slate-700 transition-shadow hover:shadow-sm overflow-hidden">
                            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div className="mb-3 sm:mb-0">
                                    <h3 className="font-bold text-slate-200 text-lg">{report.user.fullName} <span className="text-slate-400 font-normal">(ID: {report.user.username})</span></h3>
                                    <p className="text-slate-400 text-sm">Submitted on: {new Date(report.submissionDate).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                                    <span className={`px-3 py-1 text-xs font-bold leading-none rounded-full w-20 text-center ${report.overallResult ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {report.overallResult ? 'Pass' : 'Fail'}
                                    </span>
                                     <button onClick={() => setViewingCertificateFor(report)} className="px-4 py-2 font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm w-full sm:w-auto border bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600">
                                        Certificate
                                    </button>
                                    <button onClick={() => handleShareReport(report)} className={`px-4 py-2 font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm w-full sm:w-auto border ${copiedReportId === report.id ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'}`}>
                                        {copiedReportId === report.id ? 'Copied!' : 'Share'}
                                    </button>
                                    <button onClick={() => setSelectedReportId(selectedReportId === report.id ? null : report.id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-transform duration-200 transform hover:scale-105 shadow-sm shadow-blue-500/10 w-full sm:w-auto">
                                        {selectedReportId === report.id ? 'Hide' : 'Details'}
                                    </button>
                                </div>
                            </div>
                            {selectedReportId === report.id && selectedReport && <ReportDetailView report={selectedReport} />}
                        </div>
                    ))}
                </div>
            )}
            
            {viewingCertificateFor && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setViewingCertificateFor(null)}>
                    <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                       <Certificate
                            user={viewingCertificateFor.user}
                            completionDate={new Date(viewingCertificateFor.submissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            onClose={() => setViewingCertificateFor(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;