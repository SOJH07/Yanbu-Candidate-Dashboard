

import React from 'react';
import { Language, Translations } from '../types';

interface HeaderProps {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;
    isKioskMode: boolean;
    setIsKioskMode: React.Dispatch<React.SetStateAction<boolean>>;
    activeView: 'dashboard' | 'candidates' | 'schedule';
    setActiveView: React.Dispatch<React.SetStateAction<'dashboard' | 'candidates' | 'schedule'>>;
    t: Translations;
    notificationPermission: NotificationPermission;
    requestNotificationPermission: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, language, setLanguage, isKioskMode, setIsKioskMode, activeView, setActiveView, t, notificationPermission, requestNotificationPermission }) => {
    
    const navButtonClasses = (view: 'dashboard' | 'candidates' | 'schedule') => {
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
                {!isKioskMode && (
                     <div className="hidden lg:flex items-center gap-2 text-sm text-slate-gray">
                        <span className="w-1 h-4 bg-light-coral-red rounded"></span>
                        <span>{t.timezone}</span>
                    </div>
                )}
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
                    onClick={requestNotificationPermission}
                    className="p-2 rounded-full text-slate-gray hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 transition relative disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Toggle Notifications"
                    disabled={notificationPermission !== 'default'}
                    title={notificationPermission === 'default' ? 'Enable Notifications' : `Notifications ${notificationPermission}`}
                >
                    {notificationPermission === 'granted' ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                    ) : notificationPermission === 'denied' ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-4.06-5.657l-1.414 1.414A4.006 4.006 0 0114 8v3.586l.293.293a1 1 0 010 1.414H5.414a1 1 0 010-1.414L5.707 11.586A4.006 4.006 0 016 8V6.414l-2-2V8a6 6 0 00-2 0V6a6 6 0 006-6zm4.707 1.293a1 1 0 010 1.414L4.121 15.293a1 1 0 01-1.414-1.414L13.293 3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    )}
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