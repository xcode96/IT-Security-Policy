import React from 'react';

interface CertificateProps {
  user: { fullName: string };
  completionDate: string;
  onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ user, completionDate, onClose }) => {

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl shadow-black/20 animate-fade-in w-full">
      <div className="printable-area p-8 md:p-12 text-slate-200">
        <div className="border-4 border-blue-500/30 p-8 rounded-lg text-center relative bg-slate-900/50">
          <div className="absolute top-4 left-4 w-12 h-12 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg border border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <p className="font-semibold text-blue-400 uppercase tracking-widest text-sm">Certificate of Completion</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 font-serif">IT Security Policy Training</h1>
          
          <p className="mt-8 text-lg text-slate-300">This certificate is proudly presented to</p>
          <p className="text-3xl md:text-4xl font-bold text-blue-300 mt-2 font-serif tracking-wide">{user.fullName}</p>
          
          <div className="w-32 h-px bg-slate-600 mx-auto my-6"></div>
          
          <p className="text-slate-400">for successfully completing the mandatory IT Security Policy training modules.</p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-around items-center max-w-md mx-auto gap-8 sm:gap-4">
            <div className="text-center">
              <p className="font-serif text-lg border-t-2 border-slate-600 pt-2">{completionDate}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Date of Completion</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-lg border-t-2 border-slate-600 pt-2">Authorized Signatory</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">IT Department</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="no-print p-6 border-t border-slate-700 bg-slate-900/40 rounded-b-2xl flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5z" /></svg>
          Print Certificate
        </button>
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Certificate;