

import React from 'react';
import { Language, Translations } from '../types';

interface HeaderProps {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;
    isKioskMode: boolean;
    setIsKioskMode: React.Dispatch<React.SetStateAction<boolean>>;
    activeView: 'dashboard' | 'candidates' | 'analytics' | 'schedule';
    setActiveView: React.Dispatch<React.SetStateAction<'dashboard' | 'candidates' | 'analytics' | 'schedule'>>;
    t: Translations;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, language, setLanguage, isKioskMode, setIsKioskMode, activeView, setActiveView, t }) => {
    
    const navButtonClasses = (view: 'dashboard' | 'candidates' | 'analytics' | 'schedule') => {
        const base = 'px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200';
        if (activeView === view) {
            return `${base} bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300`;
        }
        return `${base} text-slate-gray hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20`;
    };
    
    return (
        <header className="bg-white dark:bg-eerie-black-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-6">
                 <h1 className="text-xl sm:text-2xl font-bold text-dark-green dark:text-primary-500">{isKioskMode ? 'Yanbu Candidate Kiosk' : t.dashboardTitle}</h1>
                 {!isKioskMode && (
                    <nav className="hidden md:flex items-center gap-2 p-1 bg-anti-flash-white dark:bg-eerie-black rounded-lg">
                        <button onClick={() => setActiveView('dashboard')} className={navButtonClasses('dashboard')}>
                            {t.dashboard}
                        </button>
                         <button onClick={() => setActiveView('analytics')} className={navButtonClasses('analytics')}>
                            {t.analytics}
                        </button>
                        <button onClick={() => setActiveView('candidates')} className={navButtonClasses('candidates')}>
                            {t.candidates}
                        </button>
                        <button onClick={() => setActiveView('schedule')} className={navButtonClasses('schedule')}>
                            {t.schedule}
                        </button>
                    </nav>
                )}
            </div>
            <div className="flex items-center gap-4">
                 <button
                    onClick={() => setIsKioskMode(!isKioskMode)}
                    className="p-2 rounded-full text-slate-gray hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 transition"
                    aria-label="Toggle Kiosk Mode"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>
                <button
                    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                    className="p-2 rounded-full text-slate-gray hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 transition font-semibold"
                    aria-label="Toggle Language"
                >
                    {language === 'en' ? 'AR' : 'EN'}
                </button>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full text-slate-gray hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 transition"
                    aria-label="Toggle Dark Mode"
                >
                    {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;