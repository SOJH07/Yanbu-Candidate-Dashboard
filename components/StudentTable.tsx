import React, { useState, useMemo } from 'react';
import { Student, Language, SortKey, Translations } from '../types';
import CefrBadge from './CefrBadge';

interface StudentTableProps {
    students: Student[];
    onSelectStudent: (student: Student) => void;
    t: Translations;
    language: Language;
}

const SortIcon: React.FC<{ direction: 'asc' | 'desc' | 'none' }> = ({ direction }) => {
    if (direction === 'none') return <span className="text-slate-gray/50">↕</span>;
    return direction === 'asc' ? <span className="text-primary-500">↑</span> : <span className="text-primary-500">↓</span>;
};

const StudentTable: React.FC<StudentTableProps> = ({ students, onSelectStudent, t, language }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'rank', direction: 'asc' });

    const sortedAndFilteredStudents = useMemo(() => {
        let filtered = students.filter(student =>
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id.includes(searchTerm) ||
            student.cefr.toLowerCase().includes(searchTerm.toLowerCase())
        );

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

    }, [students, searchTerm, sortConfig]);

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

    return (
        <div className="bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-eerie-black dark:text-white">{t.studentList}</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-slate-gray/40 dark:border-slate-gray/40 rounded-md bg-anti-flash-white dark:bg-eerie-black focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div className="flex-grow overflow-auto custom-scrollbar max-h-[calc(100vh-20rem)]">
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