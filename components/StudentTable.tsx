
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Student, Language, SortKey, Translations, InterviewStatus } from '../types';
import CefrBadge from './CefrBadge';

interface StudentTableProps {
    students: Student[];
    onSelectStudent: (student: Student) => void;
    t: Translations;
    language: Language;
    interviewStatuses: Record<string, InterviewStatus>;
}

const SortIcon: React.FC<{ direction: 'asc' | 'desc' | 'none' }> = ({ direction }) => {
    if (direction === 'none') return <span className="text-slate-gray/50">↕</span>;
    return direction === 'asc' ? <span className="text-primary-500">↑</span> : <span className="text-primary-500">↓</span>;
};

const StudentTable: React.FC<StudentTableProps> = ({ students, onSelectStudent, t, language, interviewStatuses }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'rank', direction: 'asc' });

    const initialFilters = {
        cefr: [] as string[],
        status: '' as 'Pass' | 'Fail' | 'No-Show' | '',
        averageRange: [0, 100] as [number, number]
    };
    const [filters, setFilters] = useState(initialFilters);
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Temporary states for complex filters
    const [tempCefr, setTempCefr] = useState<string[]>(filters.cefr);
    const [tempRange, setTempRange] = useState<[number, number]>(filters.averageRange);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setOpenFilter(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const isFilterActive = useMemo(() => {
        return filters.cefr.length > 0 || filters.status !== '' || filters.averageRange[0] !== 0 || filters.averageRange[1] !== 100;
    }, [filters]);


    const sortedAndFilteredStudents = useMemo(() => {
        let filtered = students.filter(student =>
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id.includes(searchTerm) ||
            student.cefr.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Apply filters
        if (filters.cefr.length > 0) {
            filtered = filtered.filter(s => filters.cefr.includes(s.cefr));
        }
        if (filters.status) {
            if (filters.status === 'No-Show') {
                filtered = filtered.filter(s => interviewStatuses[s.id] === 'no-show');
            } else { // Pass or Fail
                filtered = filtered.filter(s => s.status === filters.status);
            }
        }
        filtered = filtered.filter(s => s.combinedAverage >= filters.averageRange[0] && s.combinedAverage <= filters.averageRange[1]);


        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (sortConfig.key === 'firstName') {
                    const aName = `${a.firstName} ${a.lastName}`;
                    const bName = `${b.firstName} ${b.lastName}`;
                    return sortConfig.direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                     if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return filtered;

    }, [students, searchTerm, sortConfig, filters, interviewStatuses]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirection = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return 'none';
        return sortConfig.direction;
    }
    
    const headers: { key: SortKey; label: string; isSortable: boolean; }[] = [
        { key: 'rank', label: t.rank, isSortable: true },
        { key: 'firstName', label: t.name, isSortable: true },
        { key: 'id', label: t.id, isSortable: true },
        { key: 'cefr', label: t.cefr, isSortable: true },
        { key: 'combinedAverage', label: t.overallAverage, isSortable: true },
    ];
    
    const allCefrLevels = useMemo(() => Array.from(new Set(students.map(s => s.cefr))).sort(), [students]);

    const handleFilterButtonClick = (filterName: string) => {
        if (openFilter === filterName) {
            setOpenFilter(null);
        } else {
            // Sync temp states when opening a dropdown
            setTempCefr(filters.cefr);
            setTempRange(filters.averageRange);
            setOpenFilter(filterName);
        }
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
        setTempCefr([]);
        setTempRange([0, 100]);
    };

    const filterButtonClasses = (isActive: boolean) => {
        const base = 'px-4 py-2 text-sm font-medium border rounded-lg flex items-center gap-2 transition-colors duration-200';
        return isActive 
            ? `${base} bg-primary-50 dark:bg-primary-900/40 border-primary-400 text-primary-700 dark:text-primary-300`
            : `${base} bg-white dark:bg-eerie-black-800 border-slate-gray/40 hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20`;
    };
    
    const DropdownPanel: React.FC<{children: React.ReactNode}> = ({children}) => (
        <div className="absolute top-full mt-2 w-72 bg-white dark:bg-eerie-black-800 rounded-lg shadow-2xl border border-slate-gray/20 z-20 p-4">
            {children}
        </div>
    );
    
    const CefrFilter = () => (
         <div className="relative">
            <button onClick={() => handleFilterButtonClick('cefr')} className={filterButtonClasses(filters.cefr.length > 0)}>
                <span>{t.cefrLevel} {filters.cefr.length > 0 && `(${filters.cefr.length})`}</span>
                <svg className="h-4 w-4 text-slate-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openFilter === 'cefr' && (
                <DropdownPanel>
                    <div className="space-y-2">
                        {allCefrLevels.map(level => (
                             <label key={level} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tempCefr.includes(level)}
                                    onChange={() => {
                                        setTempCefr(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
                                    }}
                                    className="h-4 w-4 rounded border-slate-gray/40 text-primary-600 focus:ring-primary-500"
                                />
                                <CefrBadge cefr={level} />
                            </label>
                        ))}
                    </div>
                     <button onClick={() => { setFilters(f => ({ ...f, cefr: tempCefr })); setOpenFilter(null); }} className="mt-4 w-full bg-primary-600 text-white font-semibold py-2 rounded-lg hover:bg-primary-700 transition">{t.apply}</button>
                </DropdownPanel>
            )}
        </div>
    );

     const StatusFilter = () => (
        <div className="relative">
             <button onClick={() => handleFilterButtonClick('status')} className={filterButtonClasses(!!filters.status)}>
                 <span>{t.status}{filters.status && `: ${filters.status === 'Pass' ? t.pass : (filters.status === 'Fail' ? t.fail : t.noShowStatus)}`}</span>
                 <svg className="h-4 w-4 text-slate-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openFilter === 'status' && (
                <DropdownPanel>
                    <div className="space-y-1">
                        {(['', 'Pass', 'Fail', 'No-Show'] as const).map(status => (
                            <button key={status} onClick={() => { setFilters(f => ({ ...f, status })); setOpenFilter(null); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20">
                                {status === '' ? t.all : (status === 'Pass' ? t.pass : (status === 'Fail' ? t.fail : t.noShowStatus))}
                            </button>
                        ))}
                    </div>
                </DropdownPanel>
            )}
        </div>
    );

    const ScoreFilter = () => (
         <div className="relative">
             <button onClick={() => handleFilterButtonClick('score')} className={filterButtonClasses(filters.averageRange[0] !== 0 || filters.averageRange[1] !== 100)}>
                <span>{t.scoreRange} {(filters.averageRange[0] !== 0 || filters.averageRange[1] !== 100) && `: ${filters.averageRange[0]}-${filters.averageRange[1]}`}</span>
                 <svg className="h-4 w-4 text-slate-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openFilter === 'score' && (
                <DropdownPanel>
                    <div className="flex items-center gap-4">
                        <div>
                            <label htmlFor="min-score" className="text-xs text-slate-gray">{t.min}</label>
                             <input id="min-score" type="number" min="0" max="100" value={tempRange[0]} onChange={(e) => setTempRange([Math.max(0, Number(e.target.value)), tempRange[1]])} className="w-full p-2 mt-1 border border-slate-gray/40 rounded-md bg-anti-flash-white dark:bg-eerie-black focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="max-score" className="text-xs text-slate-gray">{t.max}</label>
                             <input id="max-score" type="number" min="0" max="100" value={tempRange[1]} onChange={(e) => setTempRange([tempRange[0], Math.min(100, Number(e.target.value))])} className="w-full p-2 mt-1 border border-slate-gray/40 rounded-md bg-anti-flash-white dark:bg-eerie-black focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                    </div>
                    <button onClick={() => { setFilters(f => ({ ...f, averageRange: tempRange })); setOpenFilter(null); }} className="mt-4 w-full bg-primary-600 text-white font-semibold py-2 rounded-lg hover:bg-primary-700 transition">{t.apply}</button>
                </DropdownPanel>
            )}
        </div>
    );


    return (
        <div className="bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-eerie-black dark:text-white">{t.studentList}</h2>
            
            <div ref={filterRef} className="mb-4 flex flex-wrap items-center gap-3 pb-4 border-b border-slate-gray/20">
                 <h3 className="text-sm font-semibold text-slate-gray">{t.filters}:</h3>
                <CefrFilter />
                <StatusFilter />
                <ScoreFilter />
                {isFilterActive && (
                    <button onClick={handleClearFilters} className="px-4 py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors">
                        {t.clearFilters}
                    </button>
                )}
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-slate-gray/40 dark:border-slate-gray/40 rounded-md bg-anti-flash-white dark:bg-eerie-black focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div className="flex-grow overflow-auto custom-scrollbar max-h-[calc(100vh-28rem)]">
                <table className="min-w-full divide-y divide-slate-gray/20">
                    <thead className="bg-anti-flash-white/50 dark:bg-eerie-black sticky top-0 z-10">
                        <tr>
                            {headers.map(({ key, label, isSortable }) => (
                                <th key={key} scope="col" className={`px-6 py-3 text-left text-xs font-medium text-slate-gray uppercase tracking-wider ${isSortable ? 'cursor-pointer' : ''}`} onClick={() => isSortable && requestSort(key)}>
                                    <div className="flex items-center gap-2">
                                        {label} {isSortable && <SortIcon direction={getSortDirection(key)} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-eerie-black-800 divide-y divide-slate-gray/20">
                        {sortedAndFilteredStudents.map((student) => (
                            <tr key={student.id} onClick={() => onSelectStudent(student)} className="hover:bg-slate-gray/10 dark:hover:bg-slate-gray/10 cursor-pointer transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-eerie-black dark:text-white">
                                    <span className="font-bold text-lg text-primary-600 dark:text-primary-400">#{student.rank}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-eerie-black dark:text-white">{`${student.firstName} ${student.lastName}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-gray">{student.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-gray">
                                    <CefrBadge cefr={student.cefr} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-eerie-black dark:text-white">
                                    {student.combinedAverage.toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentTable;
