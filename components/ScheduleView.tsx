import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Student, Language, Translations, DaySchedule, InterviewStatus } from '../types';
import { scheduleData } from '../data/scheduleData';
import useLocalStorage from '../hooks/useLocalStorage';
import StudentDetail from './StudentDetail';

interface ScheduleViewProps {
    students: Student[];
    t: Translations;
    language: Language;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ students, t, language }) => {
    const [activeDay, setActiveDay] = useState<DaySchedule>(scheduleData[0]);
    const [interviewStatuses, setInterviewStatuses] = useLocalStorage<Record<string, InterviewStatus>>('interviewStatuses', {});
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);


    const studentsMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    
    const dailyStats = useMemo(() => {
        // Use a type predicate to ensure student IDs are correctly typed as strings
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
            // Type guard ensures we only access statuses with valid string keys
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
                delete newStatuses[studentId]; // Resetting status removes it from storage
            } else {
                newStatuses[studentId] = status;
            }
            return newStatuses;
        });
        setActiveMenu(null); // Close menu after selection
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
        <div ref={menuRef} className="absolute top-8 right-2 w-40 bg-white dark:bg-eerie-black-800 rounded-md shadow-lg border border-slate-gray/20 z-20 text-sm">
             <button onClick={(e) => {e.stopPropagation(); handleStatusChange(student.id, 'completed')}} className="w-full text-left px-3 py-2 hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500"></div>{t.markCompleted}
            </button>
            <button onClick={(e) => {e.stopPropagation(); handleStatusChange(student.id, 'no-show')}} className="w-full text-left px-3 py-2 hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-gray"></div>{t.markNoShow}
            </button>
            <div className="border-t border-slate-gray/10 my-1"></div>
            <button onClick={(e) => {e.stopPropagation(); handleStatusChange(student.id, 'pending')}} className="w-full text-left px-3 py-2 hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20">{t.resetStatus}</button>
        </div>
    );


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
                 <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSelectedStudent(null)}>
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl h-[90vh] z-50" onClick={e => e.stopPropagation()}>
                         <StudentDetail 
                            student={selectedStudent} 
                            students={students}
                            onClose={() => setSelectedStudent(null)} 
                            t={t} 
                            language={language}
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
            
            {/* Progress Dashboard */}
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


            <div className="overflow-x-auto custom-scrollbar">
                <div className="grid bg-slate-gray/20 dark:bg-slate-gray/50 min-w-[800px]" style={{gridTemplateColumns: '60px repeat(4, 1fr)', gap: '1px'}}>
                    {/* Header Row */}
                    <div className="bg-anti-flash-white dark:bg-eerie-black-800 p-2 text-center font-bold text-xs text-slate-gray uppercase tracking-wider"></div>
                    {activeDay.rooms.map((room, index) => (
                         <div key={room.roomName} className="bg-anti-flash-white dark:bg-eerie-black-800 p-3 text-center font-bold text-sm text-red-800 dark:text-light-coral-red">
                            {t.room} {index + 1}
                        </div>
                    ))}

                    {/* Schedule Rows */}
                    {activeDay.allTimes.map(time => {
                         if (activeDay.breakTimes.includes(time)) {
                            return (
                                <div key={time} className="col-span-5 bg-slate-gray/80 dark:bg-eerie-black-800 text-white font-semibold text-center py-2 text-sm">
                                    {time} {t.break}
                                </div>
                            );
                        }
                        return (
                             <React.Fragment key={time}>
                                <div className="bg-anti-flash-white dark:bg-eerie-black-800 p-2 text-center font-mono text-sm text-slate-gray flex items-center justify-center">
                                    {time}
                                </div>
                                {activeDay.rooms.map(room => {
                                    const slot = room.slots.find(s => s.time === time);
                                    const student = slot?.studentId ? studentsMap.get(slot.studentId) : null;
                                    const status = student ? interviewStatuses[student.id] || 'pending' : 'pending';
                                    
                                    return (
                                        <div key={`${room.roomName}-${time}`} className="bg-white dark:bg-eerie-black-800 min-h-[70px]">
                                            <ScheduleCell 
                                                student={student || null}
                                                status={status}
                                                onSelect={() => student && setSelectedStudent(student)}
                                            />
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ScheduleView;