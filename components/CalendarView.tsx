
import React from 'react';
import { Student, DaySchedule, Translations, InterviewStatus, Language } from '../types';

interface CalendarViewProps {
    scheduleData: DaySchedule[];
    studentsMap: Map<string, Student>;
    t: Translations;
    interviewStatuses: Record<string, InterviewStatus>;
    onSelectStudent: (student: Student) => void;
    language: Language;
}

const CalendarView: React.FC<CalendarViewProps> = ({ scheduleData, studentsMap, t, interviewStatuses, onSelectStudent, language }) => {
    const year = 2024;
    const month = 8; 

    const interviewsByDate = React.useMemo(() => {
        const map = new Map<number, any[]>();
        scheduleData.forEach(day => {
            const dayMatch = day.dayName.match(/(\d+)\//);
            if (!dayMatch) return;
            const date = parseInt(dayMatch[1], 10);
            
            const dailyInterviews: any[] = [];
            day.rooms.forEach(room => {
                room.slots.forEach(slot => {
                    if (slot.studentId) {
                        const student = studentsMap.get(slot.studentId);
                        if (student) {
                            dailyInterviews.push({ ...slot, student });
                        }
                    }
                });
            });
            dailyInterviews.sort((a, b) => a.time.localeCompare(b.time));
            map.set(date, dailyInterviews);
        });
        return map;
    }, [scheduleData, studentsMap]);

    const renderCalendar = () => {
        const date = new Date(year, month, 1);
        const firstDayOfMonth = date.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`blank-${i}`} className="border-r border-b border-slate-gray/10 dark:border-slate-gray/50 min-h-[120px]"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const todaysInterviews = interviewsByDate.get(day) || [];
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            days.push(
                <div key={day} className="border-r border-b border-slate-gray/10 dark:border-slate-gray/50 min-h-[120px] p-2 flex flex-col relative">
                    <span className={`font-semibold text-sm ${isToday ? 'bg-primary-500 text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-eerie-black dark:text-white'}`}>
                        {day}
                    </span>
                    {todaysInterviews.length > 0 && (
                        <div className="mt-1 flex-grow overflow-y-auto custom-scrollbar text-xs space-y-1">
                            {todaysInterviews.map(({ student, time }) => {
                                const status = interviewStatuses[student.id] || 'pending';
                                let statusClass = '';
                                if (status === 'completed') statusClass = 'border-l-2 border-primary-500';
                                if (status === 'no-show') statusClass = 'border-l-2 border-slate-500 opacity-60';
                                return (
                                    <button
                                        key={student.id}
                                        onClick={() => onSelectStudent(student)}
                                        className={`w-full text-left p-1 rounded-sm bg-anti-flash-white dark:bg-eerie-black/50 hover:bg-celadon-green/20 ${statusClass}`}
                                    >
                                        <p className="font-semibold truncate">{`${student.firstName} ${student.lastName}`}</p>
                                        <p className="text-slate-gray">{time}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const weekdays = language === 'ar' 
        ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="mt-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-eerie-black dark:text-white">September 2024</h3>
            </div>
            <div className="grid grid-cols-7 bg-anti-flash-white dark:bg-eerie-black-800 rounded-t-lg">
                {weekdays.map(day => (
                    <div key={day} className="text-center font-bold text-slate-gray text-sm p-2">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 bg-white dark:bg-eerie-black-800/50 rounded-b-lg shadow-md overflow-hidden border-t-0 border-slate-gray/10 dark:border-slate-gray/50">
                {renderCalendar()}
            </div>
        </div>
    );
};

export default CalendarView;
