import React, { useState, useMemo } from 'react';
import { Student, Language, Translations, DaySchedule } from '../types';
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
    const [checkedSlots, setCheckedSlots] = useLocalStorage<string[]>('checkedSlots', []);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const studentsMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    const handleCheck = (studentId: string) => {
        setCheckedSlots(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return Array.from(newSet);
        });
    };
    
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

    const ScheduleCell: React.FC<{ student: Student | null; isChecked: boolean; onCheck: () => void; onSelect: () => void; }> = ({ student, isChecked, onCheck, onSelect }) => {
        if (!student) {
            return <div className="p-2 h-full text-center text-sm text-slate-gray/70 flex items-center justify-center">{t.available}</div>
        }
        
        const cellClasses = `p-2.5 h-full w-full flex flex-col justify-between cursor-pointer transition-colors duration-200 group relative ${isChecked ? 'bg-primary-50 dark:bg-primary-950/50' : 'hover:bg-slate-gray/5 dark:hover:bg-slate-gray/10'}`;

        return (
            <div className={cellClasses} onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
                <div>
                    <p className={`font-semibold text-sm truncate ${isChecked ? 'text-primary-800 dark:text-primary-300' : 'text-eerie-black dark:text-white'}`}>{`${student.firstName} ${student.lastName}`}</p>
                    <p className={`text-xs ${isChecked ? 'text-slate-gray/80' : 'text-slate-gray'}`}>{student.id}</p>
                </div>
                 <div className="absolute top-2 right-2" onClick={(e) => { e.stopPropagation(); onCheck(); }}>
                    <input 
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="h-5 w-5 rounded-md border-slate-gray/40 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        aria-label={`Mark ${student.firstName} as completed`}
                    />
                </div>
            </div>
        );
    };

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
            
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-eerie-black dark:text-white">{t.schedule}</h2>
                 <div className="flex items-center gap-2 p-1.5 bg-anti-flash-white dark:bg-eerie-black rounded-xl">
                    <DayTab day={scheduleData[0]} />
                    <DayTab day={scheduleData[1]} />
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
                                    const isChecked = student ? checkedSlots.includes(student.id) : false;
                                    
                                    return (
                                        <div key={`${room.roomName}-${time}`} className="bg-white dark:bg-eerie-black-800 min-h-[70px]">
                                            <ScheduleCell 
                                                student={student || null}
                                                isChecked={isChecked}
                                                onCheck={() => student && handleCheck(student.id)}
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
