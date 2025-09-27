
import React, { useRef, useMemo, useState, forwardRef, useEffect } from 'react';
import { Student, Translations, Language, Grade } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import CefrBadge from './CefrBadge';

// Subject categorization
const subjectCategories: { [key: string]: string[] } = {
    'Foundational Sciences': ['Calculus', 'General Chemistry', 'General Physics'],
    'Engineering Core': ['Applied Statics', 'Applied Statistics', 'Applied Thermodynamics', 'Materials Technology'],
    'Industrial Applications': ['Industrial Electricity', 'Machining Processes', 'Plant Maintenance'],
    'Safety & Management': ['H&S', 'Industrial Safety', 'Industrial Supervision'],
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

const ScoreBar: React.FC<{ subject: string; score: number }> = ({ subject, score }) => {
    const getScoreGradient = (s: number) => {
        if (s < 60) return 'from-red-500 to-light-coral-red';
        if (s >= 85) return 'from-primary-500 to-electric-green';
        return 'from-slate-500 to-slate-gray';
    };

    return (
        <div className="py-2">
            <div className="text-sm text-slate-gray mb-1.5">{subject}</div>
            <div className="flex items-center gap-3">
                <div className="w-full bg-anti-flash-white dark:bg-eerie-black-800 rounded-full h-3 shadow-inner">
                    <div
                        className={`bg-gradient-to-r ${getScoreGradient(score)} h-3 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${score}%` }}
                    />
                </div>
                <span className="text-base font-bold text-eerie-black dark:text-white w-8 text-right">{score}</span>
            </div>
        </div>
    );
};

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


interface PerformanceOverviewContentProps {
    student: Student;
    t: Translations;
    pageData: any[];
    strengths: { subject: string; score: number; }[];
    developments: { subject: string; score: number; }[];
    isEnglishStrength: boolean;
    isEnglishDevelopment: boolean;
    isPrinting?: boolean;
}
const PerformanceOverviewContent: React.FC<PerformanceOverviewContentProps> = ({ student, t, pageData, strengths, developments, isEnglishStrength, isEnglishDevelopment, isPrinting = false }) => {
    const radarNameMap = { 'Candidate': student.firstName, 'Cohort Average': t.average };
    return (
        <div className="space-y-6 flex flex-col">
            <div className="p-4 rounded-lg bg-anti-flash-white/50 dark:bg-eerie-black/50 border border-slate-gray/20">
                <h3 className="text-xl font-semibold mb-2 text-eerie-black dark:text-white">{t.performanceOverview}</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={pageData}>
                            <PolarGrid stroke="rgba(112, 127, 152, 0.2)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#707F98' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(29, 30, 28, 0.9)', border: '1px solid rgba(112, 127, 152, 0.2)', color: '#E9EEF0', borderRadius: '8px' }} formatter={(value: any, name: any) => [value, radarNameMap[name] || name]} />
                            <Radar name="Candidate" dataKey="candidateScore" stroke="#62B766" fill="#62B766" fillOpacity={0.6} animationDuration={isPrinting ? 0 : 300} />
                            <Radar name="Cohort Average" dataKey="cohortScore" stroke="#707F98" fill="#707F98" fillOpacity={0.2} animationDuration={isPrinting ? 0 : 300} />
                            <Legend verticalAlign="top" height={36} iconSize={10} formatter={(value) => <span className="text-eerie-black dark:text-gray-300 text-xs">{radarNameMap[value] || value}</span>} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="flex-grow space-y-4">
                <div>
                    <h4 className="text-md font-semibold text-eerie-black dark:text-gray-300 mb-2">{t.keyStrengths}</h4>
                    <ul className="space-y-2">
                        {isEnglishStrength && (
                            <li className="flex items-start gap-3"><StrengthIcon className="mt-0.5" /><div><span className="font-semibold text-sm">{t.englishProficiency}</span><p className="text-xs text-slate-gray">{t.englishProficiencyStrengthDesc}</p></div></li>
                        )}
                        {strengths.map(s => (
                            <li key={s.subject} className="flex items-start gap-3"><StrengthIcon className="mt-0.5" /><div><span className="font-semibold text-sm">{s.subject}</span><p className="text-xs text-slate-gray">Leverage this strong foundation in practical scenarios.</p></div></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-eerie-black dark:text-gray-300 mb-2">{t.areasForDevelopment}</h4>
                    <ul className="space-y-2">
                        {isEnglishDevelopment && (
                            <li className="flex items-start gap-3"><DevelopmentIcon className="mt-0.5" /><div><span className="font-semibold text-sm">{t.englishProficiency}</span><p className="text-xs text-slate-gray">{t.englishProficiencyDevelopmentDesc}</p></div></li>
                        )}
                        {developments.map(d => (
                            <li key={d.subject} className="flex items-start gap-3"><DevelopmentIcon className="mt-0.5" /><div><span className="font-semibold text-sm">{d.subject}</span><p className="text-xs text-slate-gray">Focus on targeted review to boost performance here.</p></div></li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

interface DetailedScoresContentProps {
    t: Translations;
    categorizedGrades: { [key: string]: Grade[] };
}
const DetailedScoresContent: React.FC<DetailedScoresContentProps> = ({ t, categorizedGrades }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-eerie-black dark:text-white">{t.detailedScores}</h3>
            {Object.keys(categorizedGrades).map((category) => {
                const grades = categorizedGrades[category];
                if (grades.length === 0) return null;
                return (
                    <div key={category} className="p-4 rounded-lg bg-anti-flash-white/50 dark:bg-eerie-black/50 border border-slate-gray/20">
                        <h4 className="text-lg font-semibold text-eerie-black dark:text-white border-b border-slate-gray/20 pb-2 mb-2">{category}</h4>
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

interface PrintableReportProps extends PerformanceOverviewContentProps {
    categorizedGrades: { [key: string]: Grade[] };
}
const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
    (props, ref) => {
        const { student, t } = props;
        return (
            <div ref={ref} className="p-8 bg-white dark:bg-eerie-black-800 text-eerie-black dark:text-anti-flash-white" style={{ width: '1240px' }}>
                <div className="flex items-center justify-between mb-4 border-b border-slate-gray/20 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0 h-20 w-20 rounded-full bg-anti-flash-white dark:bg-eerie-black flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">{student.firstName} {student.lastName}</h2>
                            <p className="text-md text-slate-gray">{t.id}: {student.id}</p>
                        </div>
                    </div>
                     <h3 className="text-2xl font-bold text-slate-gray">Talent Assessment Profile</h3>
                </div>
                <TAPHeader student={student} t={t} />
                <div className="grid grid-cols-2 gap-8 mt-6">
                    <PerformanceOverviewContent {...props} isPrinting={true} />
                    <DetailedScoresContent t={t} categorizedGrades={props.categorizedGrades} />
                </div>
                <div className="text-center text-xs text-slate-gray mt-8 border-t border-slate-gray/20 pt-4">
                    Generated on {new Date().toLocaleDateString()} - Yanbu Candidate Dashboard
                </div>
            </div>
        );
    }
);

interface StudentDetailProps {
    student: Student;
    students: Student[];
    onClose: () => void;
    t: Translations;
    language: Language;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, students, onClose, t, language }) => {
    const [isExporting, setIsExporting] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState<'overview' | 'scores'>('overview');

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
    
    const pageData = useMemo(() => {
        const studentCategoryAverages = Object.keys(subjectCategories).map(category => {
            const grades = student.grades.filter(g => subjectCategories[category].includes(g.subject));
            const avg = grades.length > 0 ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length : 0;
            return { subject: category, score: parseFloat(avg.toFixed(1)) };
        });

        const cohortScores: { [key: string]: number[] } = {};
        Object.keys(subjectCategories).forEach(cat => cohortScores[cat] = []);
        students.forEach(s => {
            s.grades.forEach(g => {
                for (const category in subjectCategories) {
                    if (subjectCategories[category].includes(g.subject)) {
                        cohortScores[category].push(g.score);
                        return;
                    }
                }
            });
        });
        const cohortCategoryAverages = Object.keys(cohortScores).map(category => {
            const scores = cohortScores[category];
            const avg = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
            return { subject: category, score: parseFloat(avg.toFixed(1)) };
        });

        return studentCategoryAverages.map(sCat => {
            const cohortCat = cohortCategoryAverages.find(cCat => cCat.subject === sCat.subject);
            return {
                subject: sCat.subject.replace(/ & /g, ' & '),
                candidateScore: sCat.score,
                cohortScore: cohortCat ? cohortCat.score : 0,
            };
        });
    }, [student, students]);

    const { strengths, developments, isEnglishStrength, isEnglishDevelopment } = useMemo(() => {
        const categoryAverages = Object.keys(categorizedGrades)
            .map(category => {
                const grades = categorizedGrades[category];
                if (grades.length === 0) return { subject: category, score: 0 };
                const average = parseFloat((grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1));
                return { subject: category, score: average };
            })
            .filter(cat => cat.score > 0);

        const sortedCategories = [...categoryAverages].sort((a, b) => b.score - a.score);

        return {
            strengths: sortedCategories.slice(0, 2).filter(c => c.score >= 75),
            developments: sortedCategories.slice(-2).filter(c => c.score < 75).reverse(),
            isEnglishStrength: ['C1', 'C2'].includes(student.cefr),
            isEnglishDevelopment: ['A1', 'A2'].includes(student.cefr),
        };
    }, [categorizedGrades, student.cefr]);

    const reportProps = useMemo(() => ({
        student,
        t,
        pageData,
        categorizedGrades,
        strengths,
        developments,
        isEnglishStrength,
        isEnglishDevelopment,
    }), [student, t, pageData, categorizedGrades, strengths, developments, isEnglishStrength, isEnglishDevelopment]);


    useEffect(() => {
        if (!isExporting) {
            return;
        }
        
        const timer = setTimeout(async () => {
            const reportNode = printRef.current;
            if (reportNode) {
                try {
                    const isDark = document.documentElement.classList.contains('dark');
                    const options = { 
                        scale: 2, 
                        backgroundColor: isDark ? '#1D1E1C' : '#ffffff', 
                        useCORS: true,
                        windowWidth: reportNode.scrollWidth,
                        windowHeight: reportNode.scrollHeight,
                    };

                    const canvas = await html2canvas(reportNode, options);
                    const imgData = canvas.toDataURL('image/png');
                    
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    const imgProps = pdf.getImageProperties(imgData);
                    const ratio = imgProps.width / imgProps.height;

                    let finalWidth = pdfWidth - 20;
                    let finalHeight = finalWidth / ratio;
                    
                    if (finalHeight > pdfHeight - 20) {
                        finalHeight = pdfHeight - 20;
                        finalWidth = finalHeight * ratio;
                    }

                    const x = (pdfWidth - finalWidth) / 2;
                    const y = (pdfHeight - finalHeight) / 2;
                    
                    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
                    pdf.save(`${student.firstName}_${student.lastName}_Report.pdf`);

                } catch (error) {
                    console.error("Error generating PDF:", error);
                } finally {
                    setIsExporting(false);
                }
            } else {
                 console.error("Could not find the report element to print.");
                 setIsExporting(false);
            }
        }, 500); // Increased timeout to ensure chart rendering
        
        return () => clearTimeout(timer);
    }, [isExporting, student.firstName, student.lastName, reportProps]);

    const handleExportPDF = () => {
        if (!isExporting) {
            setIsExporting(true);
        }
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
            {isExporting && <div style={{ position: 'absolute', top: 0, left: '-9999px', zIndex: -1 }}><PrintableReport ref={printRef} {...reportProps} /></div>}
            
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
            
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {currentPage === 'overview' && <PerformanceOverviewContent {...reportProps} />}
                {currentPage === 'scores' && <DetailedScoresContent t={t} categorizedGrades={categorizedGrades} />}
            </div>
        </div>
    );
};

export default StudentDetail;