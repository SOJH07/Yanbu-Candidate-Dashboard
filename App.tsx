

import React, { useState, useEffect, useMemo } from 'react';
import { parseStudentData } from './data/studentData';
import { Student, Language, InterviewStatus } from './types';
import { translations } from './utils/translations';
import Header from './components/Header';
import StudentTable from './components/StudentTable';
import StudentDetail from './components/StudentDetail';
import KioskView from './components/KioskView';
import useLocalStorage from './hooks/useLocalStorage';
import ScheduleView from './components/ScheduleView';
import DashboardAnalyticsView from './components/DashboardAnalyticsView';
import { scheduleData } from './data/scheduleData';
import NotificationToast from './components/NotificationToast';

interface AppNotification {
    id: number;
    title: string;
    message: string;
    student: Student;
}

const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [isKioskMode, setIsKioskMode] = useLocalStorage<boolean>('kioskMode', false);
    const [activeView, setActiveView] = useLocalStorage<'dashboard' | 'candidates' | 'schedule'>('activeView', 'dashboard');
    const [interviewStatuses, setInterviewStatuses] = useLocalStorage<Record<string, InterviewStatus>>('interviewStatuses', {});

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // Set permission from Notification API on initial load
        if (typeof Notification !== 'undefined') {
            setNotificationPermission(Notification.permission);
        }
    }, []);


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

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                setNotificationPermission(permission);
            });
        }
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        if (students.length === 0) return;

        const upcomingInterviews: any[] = [];
        const now = new Date();

        scheduleData.forEach(day => {
            const dayMatch = day.dayName.match(/(\d+)\/(\w+)/);
            if (!dayMatch) return;
            
            const dayOfMonth = parseInt(dayMatch[1], 10);
            const monthStr = dayMatch[2];
            const year = 2024;
            const months: { [key: string]: number } = { 'Sep': 8 };
            const month = months[monthStr];

            day.rooms.forEach(room => {
                room.slots.forEach(slot => {
                    if (slot.studentId) {
                        const [hours, minutes] = slot.time.split(':').map(Number);
                        
                        // Timezone-aware date construction
                        const monthPadded = String(month + 1).padStart(2, '0');
                        const dayPadded = String(dayOfMonth).padStart(2, '0');
                        const hoursPadded = String(hours).padStart(2, '0');
                        const minutesPadded = String(minutes).padStart(2, '0');
                        const isoString = `${year}-${monthPadded}-${dayPadded}T${hoursPadded}:${minutesPadded}:00+03:00`;
                        const interviewDate = new Date(isoString);

                        const notificationTime = new Date(interviewDate.getTime() - 5 * 60 * 1000);

                        if (notificationTime > now) {
                            const student = students.find(s => s.id === slot.studentId);
                            if (student) {
                                upcomingInterviews.push({
                                    time: notificationTime,
                                    student,
                                    roomName: room.roomName,
                                    interviewTime: slot.time,
                                });
                            }
                        }
                    }
                });
            });
        });

        const timeouts = upcomingInterviews.map(interview => {
            const delay = interview.time.getTime() - now.getTime();
            return setTimeout(() => {
                if (activeView === 'dashboard' || activeView === 'schedule') {
                    const newNotification = {
                        id: Date.now(),
                        title: t.upcomingInterview,
                        message: `${t.interviewWith} ${interview.student.firstName} ${interview.student.lastName} ${t.in} ${interview.roomName} ${t.at} ${interview.interviewTime}.`,
                        student: interview.student,
                    };
                    
                    setNotifications(prev => [...prev, newNotification]);

                    if (notificationPermission === 'granted') {
                        new Notification(newNotification.title, {
                            body: newNotification.message,
                            icon: '/vite.svg'
                        });
                    }
                }
            }, delay);
        });

        return () => {
            timeouts.forEach(clearTimeout);
        };

    }, [students, activeView, notificationPermission, t]);


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
                notificationPermission={notificationPermission}
                requestNotificationPermission={requestNotificationPermission}
            />
            <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
                {isKioskMode ? (
                    <KioskView students={students} t={t} language={language} />
                ) : (
                    <>
                        {activeView === 'dashboard' && (
                           <DashboardAnalyticsView students={students} t={t} language={language} />
                        )}
                        {activeView === 'schedule' && (
                           <ScheduleView 
                                students={students} 
                                t={t} 
                                language={language}
                                interviewStatuses={interviewStatuses}
                                setInterviewStatuses={setInterviewStatuses}
                                onSelectStudent={setSelectedStudent}
                                selectedStudent={selectedStudent}
                            />
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
                                            students={students}
                                            onClose={() => setSelectedStudent(null)} 
                                            t={t} 
                                            language={language}
                                            interviewStatuses={interviewStatuses}
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
             <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[60]">
                <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {notifications.map((notif) => (
                        <NotificationToast
                            key={notif.id}
                            notification={notif}
                            onDismiss={() => removeNotification(notif.id)}
                            onSelectStudent={(student) => {
                                setActiveView('schedule');
                                setSelectedStudent(student);
                            }}
                            t={t}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;