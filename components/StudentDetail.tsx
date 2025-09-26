

import React, { useRef, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
import { Student, Translations, Language, Grade } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label, LabelList, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import CefrBadge from './CefrBadge';

// Subject categorization
const subjectCategories: { [key: string]: string[] } = {
    'Found. Sciences': ['Calculus', 'General Chemistry', 'General Physics'],
    'Eng. Core': ['Applied Statics', 'Applied Statistics', 'Applied Thermodynamics', 'Materials Technology'],
    'Ind. Apps': ['Industrial Electricity', 'Machining Processes', 'Plant Maintenance'],
    'Safety & Mgmt': ['H&S', 'Industrial Safety', 'Industrial Supervision'],
};


const Stat: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`text-center p-2 rounded-lg bg-anti-flash-white/50 dark:bg-eerie-black/50 ${className}`}>
        <p className="text-xs text-slate-gray uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-eerie-black dark:text-white">{value}</p>
    </div>
);

const TAPHeader: React.FC<{ student: Student; t: Translations }> = ({ student, t }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 rounded-lg bg-anti-flash-white dark:bg-eerie-black border border-slate-gray/20">
        <Stat label={t.rank} value={`#${student.rank}`} />
        <Stat label={t.techAverage} value={student.average.toFixed(1)} />
        <Stat label={t.englishScore} value={student.englishScore} />
        <Stat label={t.overallAverage} value={student.combinedAverage.toFixed(1)} className="bg-primary-500/10 dark:bg-primary-500/20" />
    </div>
);

const Page1Content: React.FC<{ student: Student; t: Translations; categorizedGrades: { [key: string]: Grade[] } }> = ({ student, t, categorizedGrades }) => {
    const categoryAverages = useMemo(() => {
        return Object.keys(categorizedGrades)
            .map(category => {
                const grades = categorizedGrades[category];
                if (grades.length === 0) return { subject: category, score: 0, fullMark: 100 };
                const average = parseFloat((grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1));
                return { subject: category, score: average, fullMark: 100 };
            })
            .filter(cat => cat.score > 0);
    }, [categorizedGrades]);

    const sortedCategories = useMemo(() => 
        [...categoryAverages].sort((a, b) => b.score - a.score), 
    [categoryAverages]);

    const strengths = sortedCategories.slice(0, 2).filter(c => c.score >= 75);
    const developments = sortedCategories.slice(-2).filter(c => c.score < 75).reverse();
    
    const isEnglishStrength = ['C1', 'C2'].includes(student.cefr);
    const isEnglishDevelopment = ['A1', 'A2'].includes(student.cefr);
    
    const StrengthIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg className={`h-5 w-5 text-primary-500 flex-shrink-0 ${className}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );
    const DevelopmentIcon: React.FC<{ className?: string }> = ({ className }) => (
         <svg className={`h-5 w-5 text-yellow-500 flex-shrink-0 ${className}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.37-1.21 3.006 0l5.485 10.476c.636 1.21-.26 2.748-1.503 2.748H4.275c-1.243 0-2.139-1.538-1.503-2.748L8.257 3.099zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
            <div className="h-80 p-4 rounded-lg bg-anti-flash-white/50 dark:bg-eerie-black/50 border border-slate-gray/20">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryAverages}>
                        <PolarGrid stroke="rgba(112, 127, 152, 0.2)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#707F98' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(29, 30, 28, 0.9)',
                                border: 'none',
                                color: '#E9EEF0',
                                borderRadius: '8px',
                            }}
                        />
                        <Radar name="Average Score" dataKey="score" stroke="#62B766" fill="#62B766" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-4">
                 <div>
                    <h4 className="text-md font-semibold text-eerie-black dark:text-gray-300 mb-2">{t.keyStrengths}</h4>
                    <ul className="space-y-2">
                        {isEnglishStrength && (
                            <li key="english-strength" className="flex items-start gap-3 p-3 bg-anti-flash-white/50 dark:bg-eerie-black/50 rounded-lg border border-slate-gray/20">
                                <StrengthIcon className="mt-0.5" />
                                <div>
                                    <div className="flex items-baseline">
                                        <span className="font-semibold text-sm text-eerie-black dark:text-white">{t.englishProficiency}</span>
                                        <span className="text-xs text-slate-gray ml-2">{student.cefr}</span>
                                    </div>
                                    <p className="text-xs text-slate-gray mt-1">{t.englishProficiencyStrengthDesc}</p>
                                </div>
                            </li>
                        )}
                        {strengths.map(s => (
                            <li key={s.subject} className="flex items-start gap-3 p-3 bg-anti-flash-white/50 dark:bg-eerie-black/50 rounded-lg border border-slate-gray/20">
                                <StrengthIcon className="mt-0.5" />
                                <div>
                                    <div className="flex items-baseline">
                                        <span className="font-semibold text-sm text-eerie-black dark:text-white">{s.subject}</span>
                                        <span className="text-xs text-slate-gray ml-2">Avg: {s.score}</span>
                                    </div>
                                    <p className="text-xs text-slate-gray mt-1">Leverage this strong foundation in practical scenarios.</p>
                                </div>
                            </li>
                        ))}
                        {strengths.length === 0 && !isEnglishStrength && <li className="text-sm text-slate-gray italic p-2">No distinct strengths identified.</li>}
                    </ul>
                </div>
                 <div>
                    <h4 className="text-md font-semibold text-eerie-black dark:text-gray-300 mb-2">{t.areasForDevelopment}</h4>
                    <ul className="space-y-2">
                        {isEnglishDevelopment && (
                            <li key="english-dev" className="flex items-start gap-3 p-3 bg-anti-flash-white/50 dark:bg-eerie-black/50 rounded-lg border border-slate-gray/20">
                                <DevelopmentIcon className="mt-0.5" />
                                <div>
                                    <div className="flex items-baseline">
                                        <span className="font-semibold text-sm text-eerie-black dark:text-white">{t.englishProficiency}</span>
                                        <span className="text-xs text-slate-gray ml-2">{student.cefr}</span>
                                    </div>
                                    <p className="text-xs text-slate-gray mt-1">{t.englishProficiencyDevelopmentDesc}</p>
                                </div>
                            </li>
                        )}
                        {developments.map(d => (
                             <li key={d.subject} className="flex items-start gap-3 p-3 bg-anti-flash-white/50 dark:bg-eerie-black/50 rounded-lg border border-slate-gray/20">
                                <DevelopmentIcon className="mt-0.5" />
                                 <div>
                                     <div className="flex items-baseline">
                                        <span className="font-semibold text-sm text-eerie-black dark:text-white">{d.subject}</span>
                                        <span className="text-xs text-slate-gray ml-2">Avg: {d.score}</span>
                                     </div>
                                     <p className="text-xs text-slate-gray mt-1">Focus on targeted review to boost performance here.</p>
                                </div>
                            </li>
                        ))}
                        {developments.length === 0 && !isEnglishDevelopment && <li className="text-sm text-slate-gray italic p-2">No specific development areas identified.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const ScoreBar: React.FC<{ subject: string; score: number }> = ({ subject, score }) => {
    const getScoreColor = (s: number) => {
        if (s < 60) return 'bg-accent';
        if (s >= 85) return 'bg-primary-500';
        return 'bg-secondary';
    };

    return (
        <div className="py-2">
            <div className="text-sm text-slate-gray mb-1.5">{subject}</div>
            <div className="flex items-center gap-3">
                <div className="w-full bg-anti-flash-white dark:bg-eerie-black-800 rounded-full h-2.5 shadow-inner">
                    <div
                        className={`${getScoreColor(score)} h-2.5 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${score}%` }}
                    />
                </div>
                <span className="text-base font-bold text-eerie-black dark:text-white w-8 text-right">{score}</span>
            </div>
        </div>
    );
};


const Page2Content: React.FC<{ categorizedGrades: { [key: string]: Grade[] } }> = ({ categorizedGrades }) => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Object.keys(categorizedGrades).map((category) => {
                const grades = categorizedGrades[category];
                if (grades.length === 0) return null;
                return (
                    <div key={category} className="p-4 rounded-lg bg-anti-flash-white/50 dark:bg-eerie-black/50 border border-slate-gray/20">
                        <h3 className="text-lg font-semibold text-eerie-black dark:text-white border-b border-slate-gray/20 pb-2 mb-2">{category}</h3>
                        <div className="divide-y divide-slate-gray/10 dark:divide-slate-gray/80">
                            {grades.map(grade => (
                                <ScoreBar key={grade.subject} subject={grade.subject} score={grade.score} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const PrintableTAP = forwardRef<any, { student: Student; t: Translations; language: Language; categorizedGrades: { [key: string]: Grade[] } }>(
    ({ student, t, language, categorizedGrades }, ref) => {
        const page1Ref = useRef<HTMLDivElement>(null);
        const page2Ref = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            getPage1: () => page1Ref.current,
            getPage2: () => page2Ref.current,
        }));

        const PageWrapper: React.FC<{ children: React.ReactNode, refProp: React.Ref<HTMLDivElement> }> = ({ children, refProp }) => (
             <div ref={refProp} className="p-6 bg-white dark:bg-eerie-black-800 text-eerie-black dark:text-anti-flash-white" style={{ width: '1240px', height: '1754px', display: 'flex', flexDirection: 'column' }}>
                <div className="flex items-center gap-4 mb-6">
                     <div className="relative flex-shrink-0 h-20 w-20 rounded-full bg-anti-flash-white dark:bg-eerie-black flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
                        <p className="text-sm text-slate-gray">{t.id}: {student.id}</p>
                    </div>
                </div>
                <TAPHeader student={student} t={t} />
                <div className="flex-grow">{children}</div>
            </div>
        );

        return (
            <div>
                <PageWrapper refProp={page1Ref}>
                    <Page1Content student={student} t={t} categorizedGrades={categorizedGrades} />
                </PageWrapper>
                <PageWrapper refProp={page2Ref}>
                    <Page2Content categorizedGrades={categorizedGrades} />
                </PageWrapper>
            </div>
        );
    }
);


interface StudentDetailProps {
    student: Student;
    onClose: () => void;
    t: Translations;
    language: Language;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onClose, t, language }) => {
    const [currentPage, setCurrentPage] = useState<'overview' | 'scores'>('overview');
    const [isExporting, setIsExporting] = useState(false);
    const printRef = useRef<any>(null);

    const categorizedGrades = useMemo(() => {
        const categories: { [key: string]: Grade[] } = {};
        Object.keys(subjectCategories).forEach(cat => categories[cat] = []);

        student.grades.forEach(grade => {
            for (const category in subjectCategories) {
                if (subjectCategories[category].includes(grade.subject)) {
                    categories[category].push(grade);
                    return;
                }
            }
        });
        
        Object.keys(categories).forEach(cat => {
            categories[cat].sort((a,b) => b.score - a.score);
        });

        return categories;
    }, [student.grades]);

    const handleExportPDF = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 100));

        const page1Node = printRef.current?.getPage1();
        const page2Node = printRef.current?.getPage2();
        
        if (page1Node && page2Node) {
            try {
                const isDark = document.documentElement.classList.contains('dark');
                const options = { scale: 2, backgroundColor: isDark ? '#1D1E1C' : '#ffffff', useCORS: true };

                const canvas1 = await html2canvas(page1Node, options);
                const canvas2 = await html2canvas(page2Node, options);

                const pdf = new jsPDF('p', 'mm', 'a4');
                const addImageToPdf = (canvas: HTMLCanvasElement) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const ratio = canvasWidth / canvasHeight;
                    let width = pdfWidth - 20; // with margin
                    let height = width / ratio;
                    if (height > pdfHeight - 20) {
                        height = pdfHeight - 20;
                        width = height * ratio;
                    }
                    const xOffset = (pdfWidth - width) / 2;
                    const yOffset = 10;
                    pdf.addImage(imgData, 'PNG', xOffset, yOffset, width, height);
                };

                addImageToPdf(canvas1);
                pdf.addPage();
                addImageToPdf(canvas2);

                pdf.save(`${student.firstName}_${student.lastName}_TAP.pdf`);
            } catch (error) {
                console.error("Error generating PDF:", error);
            }
        }
        setIsExporting(false);
    };
    
    const navButtonClasses = (view: 'overview' | 'scores') => {
        const base = 'px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200';
        if (currentPage === view) {
            return `${base} bg-primary-500 text-white shadow`;
        }
        return `${base} bg-anti-flash-white dark:bg-eerie-black-800/80 text-slate-gray hover:bg-slate-gray/10 dark:hover:bg-slate-gray/20`;
    };


    return (
        <div className="bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20 h-full flex flex-col relative">
            {isExporting && <div style={{ position: 'absolute', top: 0, left: '-9999px' }}><PrintableTAP ref={printRef} student={student} t={t} language={language} categorizedGrades={categorizedGrades} /></div>}
            
            <div className="flex-shrink-0">
                <button onClick={onClose} className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-slate-gray/60 hover:text-eerie-black dark:hover:text-white transition z-10`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                    <div className="flex-shrink-0 h-20 w-20 rounded-full bg-anti-flash-white dark:bg-eerie-black flex items-center justify-center text-3xl font-bold text-primary-600 dark:text-primary-400">
                        #{student.rank}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-eerie-black dark:text-white">{student.firstName} {student.lastName}</h2>
                        <p className="text-sm text-slate-gray">{t.id}: {student.id}</p>
                        <div className="mt-2 flex items-center gap-4">
                            <CefrBadge cefr={student.cefr} />
                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${student.status === 'Pass' ? 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300' : 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent'}`}>
                                Tech: {student.status === 'Pass' ? t.pass : t.fail}
                            </span>
                        </div>
                    </div>
                </div>
                <TAPHeader student={student} t={t} />
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="p-1 bg-anti-flash-white dark:bg-eerie-black rounded-lg flex items-center gap-1">
                        <button onClick={() => setCurrentPage('overview')} className={navButtonClasses('overview')}>
                            {t.performanceOverview}
                        </button>
                        <button onClick={() => setCurrentPage('scores')} className={navButtonClasses('scores')}>
                            {t.detailedScores}
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleExportPDF} disabled={isExporting} className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition flex items-center gap-2 disabled:bg-slate-gray/50 disabled:cursor-not-allowed text-sm font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                            {isExporting ? 'Exporting...' : t.exportPDF}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
                {currentPage === 'overview' && <Page1Content student={student} t={t} categorizedGrades={categorizedGrades} />}
                {currentPage === 'scores' && <Page2Content categorizedGrades={categorizedGrades} />}
            </div>
            
        </div>
    );
};

export default StudentDetail;