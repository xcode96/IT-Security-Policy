import React, { useState, useEffect, useMemo } from 'react';
import { TrainingReport } from '../types';
import { QUIZZES, PASSING_PERCENTAGE } from '../constants';
import { API_REPORTS_URL } from '../apiConfig';
import Certificate from './Certificate';

const AdminDashboard: React.FC = () => {
    const [reports, setReports] = useState<TrainingReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [copiedReportId, setCopiedReportId] = useState<string | null>(null);
    const [viewingCertificateFor, setViewingCertificateFor] = useState<TrainingReport | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(API_REPORTS_URL);
                if (!response.ok) {
                    throw new Error(`Network response was not ok (${response.status})`);
                }
                const serverReports: TrainingReport[] = await response.json();
                setReports(serverReports.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
            } catch (err) {
                console.error("Failed to fetch reports from server:", err);
                setError("Could not connect to the live server to fetch reports. Please check your internet connection and refresh the page.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, []);

    const stats = useMemo(() => {
        const total = reports.length;
        if (total === 0) {
            return {
                totalSubmissions: 0,
                passed: 0,
                failed: 0,
                passRate: 0,
            };
        }
        const passedCount = reports.filter(r => r.overallResult).length;
        const failedCount = total - passedCount;
        const passRate = Math.round((passedCount / total) * 100);

        return { totalSubmissions: total, passed: passedCount, failed: failedCount, passRate };
    }, [reports]);

    const filteredReports = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        let results = reports;

        // Apply search filter
        if (term) {
            results = results.filter(report =>
                report.user.fullName.toLowerCase().includes(term) ||
                report.user.username.toLowerCase().includes(term)
            );
        }
        
        // Apply status filter
        if (filterStatus === 'passed') {
            return results.filter(report => report.overallResult);
        }
        if (filterStatus === 'failed') {
            return results.filter(report => !report.overallResult);
        }
        
        return results;
    }, [reports, searchTerm, filterStatus]);

    const handleExportToExcel = () => {
        if (filteredReports.length === 0) {
            alert("There are no reports to export in the current view.");
            return;
        }

        const headers = ['User Name', 'Username', 'Status'];

        // Function to escape CSV fields if they contain commas, quotes, or newlines
        const escapeCsvField = (field: string | null | undefined): string => {
            if (field === null || field === undefined) {
                return '';
            }
            const stringField = String(field);
            // Enclose in double quotes and escape existing double quotes
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };

        const csvRows = [
            headers.join(','), // Header row
            ...filteredReports.map(report => [
                escapeCsvField(report.user.fullName),
                escapeCsvField(report.user.username),
                report.overallResult ? 'Pass' : 'Fail'
            ].join(','))
        ];

        const csvContent = csvRows.join('\r\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            const url = URL.createObjectURL(blob);
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute("href", url);
            link.setAttribute("download", `user_reports_${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleClearReports = async () => {
        if (window.confirm("Are you sure you want to clear all submitted reports? This action cannot be undone.")) {
            try {
                const response = await fetch(API_REPORTS_URL, { method: 'DELETE' });
                if (!response.ok) throw new Error('Server-side deletion failed.');
                setReports([]);
                setSelectedReportId(null);
                alert('All reports have been cleared.');
            } catch (error) {
                console.error("Failed to clear reports from server:", error);
                alert("Could not clear reports from the server. Please check the server status.");
            }
        }
    };
    
    const handleShareReport = (report: TrainingReport) => {
        const date = new Date(report.submissionDate).toLocaleDateString();
        
        let reportString = `Subject: Training Report — ${report.user.fullName} — ${date}\n\n`;
        reportString += `Administrator,\n\n`;
        reportString += `Please find the training results for ${report.user.fullName} (Username: ${report.user.username}) on ${date}:\n\n`;
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

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-slate-400">Fetching live reports...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12 bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-400">Connection Error</h3>
                    <p className="mt-2 text-red-300/80">{error}</p>
                </div>
            );
        }

        if (reports.length === 0) {
            return (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-200">No reports submitted</h3>
                    <p className="mt-1 text-sm text-slate-400">As users complete their training, reports will appear here.</p>
                </div>
            );
        }

        if (filteredReports.length === 0) {
            return (
                 <div className="text-center py-12">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-200">No Reports Found</h3>
                    <p className="mt-1 text-sm text-slate-400">Your search did not match any reports. Try different keywords.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filteredReports.map(report => (
                    <div key={report.id} className="bg-slate-800 rounded-xl border border-slate-700 transition-shadow hover:shadow-sm overflow-hidden">
                        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-grow">
                                <h3 className="font-bold text-slate-200 text-lg">{report.user.fullName} <span className="text-slate-400 font-normal text-base">(Username: {report.user.username})</span></h3>
                                <p className="text-slate-400 text-sm">Submitted on: {new Date(report.submissionDate).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0 flex-wrap justify-start sm:justify-end">
                                <span className={`px-3 py-1 text-xs font-bold leading-none rounded-full w-20 text-center ${report.overallResult ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {report.overallResult ? 'Pass' : 'Fail'}
                                </span>
                                 <button onClick={() => setViewingCertificateFor(report)} className="px-4 py-2 font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm border bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600">
                                    Certificate
                                </button>
                                <button onClick={() => handleShareReport(report)} className={`px-4 py-2 font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm border ${copiedReportId === report.id ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'}`}>
                                    {copiedReportId === report.id ? 'Copied!' : 'Share'}
                                </button>
                                <button onClick={() => setSelectedReportId(selectedReportId === report.id ? null : report.id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-transform duration-200 transform hover:scale-105 shadow-sm shadow-blue-500/10">
                                    {selectedReportId === report.id ? 'Hide' : 'Details'}
                                </button>
                            </div>
                        </div>
                        {selectedReportId === report.id && selectedReport && <ReportDetailView report={selectedReport} />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Dashboard Stats */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-100 mb-4">Training Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-sm font-medium text-slate-400">Total Submissions</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.totalSubmissions}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-sm font-medium text-slate-400">Pass Rate</p>
                        <p className="text-3xl font-bold text-blue-400 mt-1">{stats.passRate}%</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-sm font-medium text-slate-400">Passed</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">{stats.passed}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-sm font-medium text-slate-400">Failed</p>
                        <p className="text-3xl font-bold text-red-400 mt-1">{stats.failed}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-slate-700 pb-4">
                 <div>
                    <h3 className="text-xl font-bold text-slate-100">Individual Reports ({filteredReports.length})</h3>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-sm font-medium text-slate-400 mr-2">Filter by:</span>
                        <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors duration-200 ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                            All
                        </button>
                        <button onClick={() => setFilterStatus('passed')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors duration-200 ${filterStatus === 'passed' ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                            Passed
                        </button>
                        <button onClick={() => setFilterStatus('failed')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors duration-200 ${filterStatus === 'failed' ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                            Failed
                        </button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search by name or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleExportToExcel} disabled={filteredReports.length === 0} className="flex-1 w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-sm transition-colors duration-200 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>
                            Export
                        </button>
                        <button onClick={handleClearReports} disabled={reports.length === 0 || isLoading} className="flex-1 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0">
                            Clear All
                        </button>
                    </div>
                </div>
            </div>

            {renderContent()}
            
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