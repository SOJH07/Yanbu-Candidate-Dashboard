
import React, { useState, useEffect, useMemo } from 'react';
import { parseStudentData } from './data/studentData';
import { Student, Language } from './types';
import { translations } from './utils/translations';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentTable from './components/StudentTable';
import StudentDetail from './components/StudentDetail';
import KioskView from './components/KioskView';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [isKioskMode, setIsKioskMode] = useLocalStorage<boolean>('kioskMode', false);
    const [activeView, setActiveView] = useLocalStorage<'dashboard' | 'candidates'>('activeView', 'dashboard');


    useEffect(() => {
        setStudents(parseStudentData());
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);
    
    const t = useMemo(() => translations[language], [language]);

    const handleSaveShortcut = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && selectedStudent) {
            e.preventDefault();
            // The saving logic is handled by the useLocalStorage hook in StudentDetail
            // We can add a visual cue here if needed, e.g., a toast notification
            console.log(`Save triggered for ${selectedStudent.firstName}`);
        }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setSelectedStudent(null);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleSaveShortcut);
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleSaveShortcut);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [selectedStudent]);


    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen text-eerie-black dark:text-anti-flash-white transition-colors duration-300 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}>
            <Header
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                language={language}
                setLanguage={setLanguage}
                isKioskMode={isKioskMode}
                setIsKioskMode={setIsKioskMode}
                activeView={activeView}
                setActiveView={setActiveView}
                t={t}
            />
            <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
                {isKioskMode ? (
                    <KioskView students={students} t={t} language={language} />
                ) : (
                    <>
                        {activeView === 'dashboard' && (
                           <Dashboard students={students} t={t} />
                        )}
                        {activeView === 'candidates' && (
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-1/2 flex flex-col gap-8">
                                    <StudentTable students={students} onSelectStudent={setSelectedStudent} t={t} language={language} />
                                </div>
                                <div className="lg:w-1/2">
                                    {selectedStudent ? (
                                        <StudentDetail 
                                            student={selectedStudent} 
                                            onClose={() => setSelectedStudent(null)} 
                                            t={t} 
                                            language={language}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-white dark:bg-eerie-black-800 rounded-xl shadow-lg border border-slate-gray/20 p-8">
                                            <div className="text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <h3 className="mt-2 text-lg font-medium text-eerie-black dark:text-white">{t.selectStudent}</h3>
                                                <p className="mt-1 text-sm text-slate-gray">{t.selectStudentPrompt}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default App;
