

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { Student, Language, Translations, DaySchedule, InterviewStatus } from '../types';
import { scheduleData } from '../data/scheduleData';
import StudentDetail from './StudentDetail';

interface ScheduleViewProps {
    students: Student[];
    t: Translations;
    language: Language;
    interviewStatuses: Record<string, InterviewStatus>;
    setInterviewStatuses: React.Dispatch<React.SetStateAction<Record<string, InterviewStatus>>>;
    onSelectStudent: (student: Student | null) => void;
    selectedStudent: Student | null;
}

// --- Icon Components ---
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
const NoSymbolIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.707 5.707a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 101.414 1.414L10 11.414l4.293 4.293a1 1 0 001.414-1.414L11.414 10l4.293-4.293a1 1 0 00-1.414-1.414L10 8.586 5.707 5.707z" clipRule="evenodd" />
    </svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);
const ArrowUturnLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.182a.75.75 0 010-1.08l3.5-3.182a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
);


const ScheduleView: React.FC<ScheduleViewProps> = ({ students, t, language, interviewStatuses, setInterviewStatuses, onSelectStudent, selectedStudent }) => {
    const [activeDay, setActiveDay] = useState<DaySchedule>(scheduleData[0]);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorTop, setIndicatorTop] = useState<number | null>(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setNow(new Date()), 60 * 1000); // Update every minute
        return () => clearInterval(timerId);
    }, []);

    const simulatedNow = useMemo(() => {
        const dayMatch = activeDay.dayName.match(/(\d+)\/(\w+)/);
        if (!dayMatch) return new Date();

        const dayOfMonth = parseInt(dayMatch[1], 10);
        const monthStr = dayMatch[2];
        const year = 2024;
        const months: { [key: string]: number } = { 'Sep': 8 };
        const month = months[monthStr];

        const simulated = new Date();
        simulated.setFullYear(year, month, dayOfMonth);
        simulated.setHours(now.getHours());
        simulated.setMinutes(now.getMinutes());
        simulated.setSeconds(now.getSeconds());
        return simulated;
    }, [now, activeDay]);

    const parseTime = (timeStr: string): number => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    useLayoutEffect(() => {
        if (!containerRef.current) {
            setIndicatorTop(null); return;
        }
        const gridEl = containerRef.current.querySelector('.schedule-grid');
        if (!gridEl) {
            setIndicatorTop(null); return;
        }

        const nowMins = simulatedNow.getHours() * 60 + simulatedNow.getMinutes();
        const timeNodes = Array.from(gridEl.querySelectorAll<HTMLDivElement>('[data-time]'));
        if (timeNodes.length < 2) {
            setIndicatorTop(null); return;
        }

        let targetNode: HTMLDivElement | null = null;
        let progress = 0;

        for (let i = 0; i < timeNodes.length; i++) {
            const node = timeNodes[i];
            const timeStr = node.dataset.time!;
            const timeMins = parseTime(timeStr);
            const nextTimeMins = (i + 1 < timeNodes.length) ? parseTime(timeNodes[i + 1].dataset.time!) : timeMins + 20;

            if (nowMins >= timeMins && nowMins < nextTimeMins) {
                targetNode = node;
                const duration = nextTimeMins - timeMins;
                if (duration > 0) {
                    progress = (nowMins - timeMins) / duration;
                }
                break;
            }
        }

        if (targetNode) {
            const nodeTop = targetNode.offsetTop;
            const nodeHeight = targetNode.offsetHeight;
            const top = nodeTop + (nodeHeight * progress);
            setIndicatorTop(top);
        } else {
            setIndicatorTop(null);
        }
    }, [simulatedNow, activeDay]);


    const studentsMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    
    const dailyStats = useMemo(() => {
        const scheduledStudentIds = new Set(
            activeDay.rooms
                .flatMap(room => room.slots)
                .map(slot => slot.studentId)
                .filter((id): id is string => !!id)
        );
        const total = scheduledStudentIds.size;
        
        let completed = 0;
        let noShows = 0;

        for (const id of scheduledStudentIds) {
            if (typeof id === 'string') {
                const status = interviewStatuses[id];
                if (status === 'completed') completed++;
                else if (status === 'no-show') noShows++;
            }
        }
        
        const remaining = total - completed - noShows;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        return { total, completed, noShows, remaining, progress };
    }, [activeDay, interviewStatuses]);


    const handleStatusChange = (studentId: string, status: InterviewStatus) => {
        setInterviewStatuses(prev => {
            const newStatuses = { ...prev };
            if (status === 'pending') {
                delete newStatuses[studentId]; 
            } else {
                newStatuses[studentId] = status;
            }
            return newStatuses;
        });
        setActiveMenu(null);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const DayTab: React.FC<{ day: DaySchedule }> = ({ day }) => {
        const isActive = activeDay.dayName === day.dayName;
        const classes = isActive 
            ? 'bg-primary-500 text-white shadow-md' 
            : 'bg-white dark:bg-eerie-black-800 text-slate-gray hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20';
        const dayKey = day.dayName.startsWith('Day 1') ? 'day1' : 'day2';
        return (
            <button onClick={() => setActiveDay(day)} className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${classes}`}>
                {t[dayKey]}
            </button>
        );
    };
    
    const StatusMenu: React.FC<{ student: Student }> = ({ student }) => (
        <div ref={menuRef} className="absolute top-8 right-2 w-48 bg-white dark:bg-eerie-black-800 rounded-md shadow-lg border border-slate-gray/20 z-20 text-sm">
             <button onClick={(e) => {e.stopPropagation(); handleStatusChange(student.id, 'completed')}} className="w-full text-left px-3 py-2 hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-primary-500" />{t.markCompleted}
            </button>
            <button onClick={(e) => {e.stopPropagation(); handleStatusChange(student.id, 'no-show')}} className="w-full text-left px-3 py-2 hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 flex items-center gap-2">
                <NoSymbolIcon className="h-4 w-4 text-slate-500" />{t.markNoShow}
            </button>
            <div className="border-t border-slate-gray/10 my-1"></div>
            <button onClick={(e) => {e.stopPropagation(); handleStatusChange(student.id, 'pending')}} className="w-full text-left px-3 py-2 hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 flex items-center gap-2">
                <ArrowUturnLeftIcon className="h-4 w-4 text-slate-500" />{t.resetStatus}
            </button>
        </div>
    );

    const StatusIconDisplay: React.FC<{ status: InterviewStatus }> = ({ status }) => {
        switch(status) {
            case 'completed': return <CheckCircleIcon className="h-5 w-5 text-primary-500" />;
            case 'no-show': return <NoSymbolIcon className="h-5 w-5 text-slate-500" />;
            default: return <ClockIcon className="h-5 w-5 text-slate-400" />;
        }
    };

    const ScheduleCell: React.FC<{ student: Student | null; status: InterviewStatus; onSelect: () => void; }> = ({ student, status, onSelect }) => {
        if (!student) {
            return <div className="p-2 h-full text-center text-sm text-slate-gray/70 flex items-center justify-center">{t.available}</div>
        }
        
        let cellClasses = `p-2.5 h-full w-full flex flex-col justify-between cursor-pointer transition-colors duration-200 group relative border-l-4 `;

        switch(status) {
            case 'completed': cellClasses += 'bg-primary-50 dark:bg-primary-950/50 border-primary-500'; break;
            case 'no-show': cellClasses += 'bg-slate-100 dark:bg-slate-800/50 border-slate-500 opacity-70'; break;
            default: cellClasses += 'hover:bg-slate-gray/5 dark:hover:bg-slate-gray/10 border-transparent';
        }
        
        const isMenuOpen = activeMenu === student.id;

        return (
            <div className={cellClasses} onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
                <div>
                    <p className={`font-semibold text-sm truncate ${status === 'completed' ? 'text-primary-800 dark:text-primary-300' : 'text-eerie-black dark:text-white'}`}>{`${student.firstName} ${student.lastName}`}</p>
                    <p className={`text-xs ${status === 'completed' ? 'text-slate-gray/80' : 'text-slate-gray'}`}>{student.id}</p>
                </div>

                <div className="self-start">
                    <StatusIconDisplay status={status} />
                </div>
                
                <div className="absolute top-2 right-2">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : student.id); }} className="p-1 rounded-full hover:bg-slate-gray/20 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-gray" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                     {isMenuOpen && <StatusMenu student={student} />}
                </div>
            </div>
        );
    };
    
    const StatCard: React.FC<{label: string, value: number, color: string}> = ({label, value, color}) => (
        <div className="bg-anti-flash-white dark:bg-eerie-black-800 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold" style={{color}}>{value}</p>
            <p className="text-xs text-slate-gray uppercase tracking-wider">{label}</p>
        </div>
    );

    return (
        <div className="bg-white/50 dark:bg-eerie-black-800/50 p-6 rounded-xl shadow-lg border border-slate-gray/20">
            {selectedStudent && (
                 <div className="fixed inset-0 bg-black/60 z-40" onClick={() => onSelectStudent(null)}>
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl h-[90vh] z-50" onClick={e => e.stopPropagation()}>
                         <StudentDetail 
                            student={selectedStudent} 
                            students={students}
                            onClose={() => onSelectStudent(null)} 
                            t={t} 
                            language={language}
                            interviewStatuses={interviewStatuses}
                        />
                    </div>
                </div>
            )}
            
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-eerie-black dark:text-white">{t.schedule}</h2>
                <div className="flex items-center gap-2 p-1.5 bg-anti-flash-white dark:bg-eerie-black rounded-xl">
                    <DayTab day={scheduleData[0]} />
                    <DayTab day={scheduleData[1]} />
                </div>
            </div>
            
            <>
                <div className="mb-6 p-4 bg-anti-flash-white/50 dark:bg-eerie-black/50 rounded-lg border border-slate-gray/20">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-eerie-black dark:text-white">{t.interviewsToday}</h3>
                        <span className="text-sm font-medium text-slate-gray">{dailyStats.completed} / {dailyStats.total} {t.completed}</span>
                    </div>
                    <div className="w-full bg-slate-gray/20 dark:bg-slate-gray/30 rounded-full h-2.5 mb-4">
                        <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${dailyStats.progress}%`}}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <StatCard label={t.completed} value={dailyStats.completed} color="#62B766" />
                        <StatCard label={t.remaining} value={dailyStats.remaining} color="#707F98" />
                        <StatCard label={t.noShows} value={dailyStats.noShows} color="#E77373" />
                    </div>
                </div>

                <div ref={containerRef} className="overflow-x-auto custom-scrollbar relative">
                    {indicatorTop !== null && (
                        <>
                            {/* The line across the schedule, behind content */}
                            <div
                                className="absolute left-[60px] right-0 z-[1] pointer-events-none"
                                style={{ 
                                    top: `${indicatorTop}px`,
                                    ...(language === 'ar' && { left: '0', right: '60px' })
                                }}
                            >
                                <div className="h-[1px] bg-light-coral-red/80"></div>
                            </div>

                            {/* The "Now" indicator label, on top of everything */}
                            <div
                                className="absolute z-20 pointer-events-none"
                                style={{
                                    top: `${indicatorTop}px`,
                                    left: language === 'ar' ? 'auto' : '60px',
                                    right: language === 'ar' ? '60px' : 'auto',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div style={{ transform: `translateX(${language === 'ar' ? '100%' : '-100%'})` }} className={`${language === 'ar' ? 'pl-2' : 'pr-2'}`}>
                                        <span className="text-xs font-bold px-2 py-0.5 bg-light-coral-red text-white rounded shadow-lg whitespace-nowrap">
                                            {t.now}
                                        </span>
                                    </div>
                                    <div 
                                        className="w-3 h-3 bg-light-coral-red rounded-full border-2 border-white dark:border-eerie-black-800 shadow"
                                        style={{ transform: `translateX(${language === 'ar' ? '50%' : '-50%'})` }}
                                    ></div>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="grid bg-slate-gray/20 dark:bg-slate-gray/50 min-w-[800px] schedule-grid" style={{gridTemplateColumns: '60px repeat(4, 1fr)', gap: '1px'}}>
                        <div className="bg-anti-flash-white dark:bg-eerie-black-800 p-2 text-center font-bold text-xs text-slate-gray uppercase tracking-wider"></div>
                        {activeDay.rooms.map((room, index) => (
                            <div key={room.roomName} className="bg-anti-flash-white dark:bg-eerie-black-800 p-3 text-center font-bold text-sm text-red-800 dark:text-light-coral-red">
                                {t.room} {index + 1}
                            </div>
                        ))}

                        {activeDay.allTimes.map(time => {
                            if (activeDay.breakTimes.includes(time)) {
                                return (
                                    <div key={time} data-time={time} className="col-span-5 bg-slate-gray/80 dark:bg-eerie-black-800 text-white font-semibold text-center py-2 text-sm">
                                        {time} {t.break}
                                    </div>
                                );
                            }
                            return (
                                <React.Fragment key={time}>
                                    <div data-time={time} className="bg-anti-flash-white dark:bg-eerie-black-800 p-2 text-center font-mono text-sm text-slate-gray flex items-center justify-center">
                                        {time}
                                    </div>
                                    {activeDay.rooms.map(room => {
                                        const slot = room.slots.find(s => s.time === time);
                                        const student = slot?.studentId ? studentsMap.get(slot.studentId) : null;
                                        const status = student ? interviewStatuses[student.id] || 'pending' : 'pending';
                                        
                                        return (
                                            <div key={`${room.roomName}-${time}`} className="bg-white dark:bg-eerie-black-800 min-h-[70px] relative z-[2]">
                                                <ScheduleCell 
                                                    student={student || null}
                                                    status={status}
                                                    onSelect={() => student && onSelectStudent(student)}
                                                />
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </>
        </div>
    );
};

export default ScheduleView;