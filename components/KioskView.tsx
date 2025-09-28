
import React, { useState } from 'react';
import { Student, Translations, Language } from '../types';
import StudentDetail from './StudentDetail';

interface KioskViewProps {
    students: Student[];
    t: Translations;
    language: Language;
}

const KioskView: React.FC<KioskViewProps> = ({ students, t, language }) => {
    const [inputId, setInputId] = useState('');
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [error, setError] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const student = students.find(s => s.id === inputId);
        if (student) {
            setFoundStudent(student);
            setError(false);
            setInputId('');
        } else {
            setError(true);
            setTimeout(() => setError(false), 500); // Reset error animation
        }
    };

    if (foundStudent) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <StudentDetail
                    student={foundStudent}
                    students={students}
                    onClose={() => setFoundStudent(null)}
                    t={t}
                    language={language}
                    interviewStatuses={{}}
                />
            </div>
        );
    }
    
    // Simple keyframe animation for the shake effect
    const style = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.5s ease-in-out;
        }
    `;

    return (
        <>
            <style>{style}</style>
            <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="w-full max-w-md text-center bg-eerie-black-800 p-8 md:p-12 rounded-2xl shadow-2xl">
                    <svg className="w-20 h-20 mx-auto text-primary-500 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2m-4 4H8" />
                        <path d="M18 18h-2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z" />
                    </svg>

                    <h1 className="text-4xl font-bold text-white mb-2">Yanbu Candidate Kiosk</h1>
                    <p className="text-slate-gray/80 mb-8">Enter Candidate ID to view details</p>

                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="text"
                                value={inputId}
                                onChange={(e) => setInputId(e.target.value)}
                                placeholder="Enter Candidate ID"
                                className={`w-full px-4 py-3 bg-eerie-black text-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${error ? 'border-accent shake' : 'border-slate-gray/50 focus:border-primary-500'}`}
                            />
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max px-3 py-1 bg-slate-gray text-white text-xs rounded-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-none z-10">
                                Please enter the 10-digit Candidate ID.
                                <svg className="absolute text-slate-gray h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-eerie-black-800 focus:ring-primary-500 transition-colors"
                        >
                            Show Candidate
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default KioskView;
