

import React, { useMemo } from 'react';
import { Student, Translations, Language } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';

interface DashboardProps {
    students: Student[];
    t: Translations;
    language: Language;
}

const StatCard: React.FC<{ title: string; value: string | number; className?: string }> = ({ title, value, className }) => (
    <div className={`bg-white dark:bg-eerie-black-800 p-4 rounded-lg shadow border border-slate-gray/20 ${className}`}>
        <h3 className="text-sm font-medium text-slate-gray truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-eerie-black dark:text-white">{value}</p>
    </div>
);

const subjectCategories: { [key: string]: string[] } = {
    'Foundational Sciences': ['Calculus', 'General Chemistry', 'General Physics'],
    'Engineering Core': ['Applied Statics', 'Applied Statistics', 'Applied Thermodynamics', 'Materials Technology'],
    'Industrial Applications': ['Industrial Electricity', 'Machining Processes', 'Plant Maintenance'],
    'Safety & Management': ['H&S', 'Industrial Safety', 'Industrial Supervision'],
};

const cefrColors: { [key: string]: string } = {
    'A1': '#e2f3e4', 'A2': '#c9e8cd',
    'B1': '#a9d9b1', 'B2': '#85c790',
    'C1': '#62B766', 'C2': '#4da255'
};

const tooltipStyle = {
    backgroundColor: 'rgba(29, 30, 28, 0.9)',
    border: '1px solid rgba(112, 127, 152, 0.2)',
    color: '#E9EEF0',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    padding: '8px 12px',
    backdropFilter: 'blur(3px)',
};


const Dashboard: React.FC<DashboardProps> = ({ students, t, language }) => {
    
    // Custom Chart Components
    const categoryColors: { [key: string]: string } = useMemo(() => ({
        'Foundational\nSciences': '#62B766',
        'Engineering\nCore': '#85c790',
        'Industrial\nApplications': '#4da255',
        'Safety\n&\nManagement': '#a9d9b1',
    }), []);

    const CustomRadarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const color = categoryColors[label] || '#707F98';
            return (
                 <div style={tooltipStyle} className="text-sm">
                    <div className="flex items-center mb-1">
                        <div style={{ width: 10, height: 10, backgroundColor: color, marginRight: 8, borderRadius: '2px' }}></div>
                        <span className="font-bold">{label.replace(/\n/g, ' ')}</span>
                    </div>
                    <p>{`${t.average}: ${payload[0].value.toFixed(1)}`}</p>
                </div>
            );
        }
        return null;
    };

    const CustomCefrTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const color = (data.payload as any).fill;
            return (
                <div style={tooltipStyle} className="text-sm">
                    <div className="flex items-center mb-1">
                         <div style={{ width: 10, height: 10, background: color, marginRight: 8, borderRadius: '2px' }}></div>
                        <span className="font-bold">{`Level ${label}`}</span>
                    </div>
                    <p>{`${data.value} ${t.candidates}`}</p>
                </div>
            );
        }
        return null;
    };

    const stats = useMemo(() => {
        if (students.length === 0) {
            return {
                totalStudents: 0,
                passRate: '0%',
                avgTechScore: 0,
                avgEnglishScore: 0,
                cefrDistribution: [],
                combinedAverageDistribution: [],
                passFailData: [],
                avgCategoryScores: [],
            };
        }

        const totalStudents = students.length;
        const passedStudents = students.filter(s => s.status === 'Pass').length;
        const passRate = `${((passedStudents / totalStudents) * 100).toFixed(1)}%`;
        
        const totalTechScore = students.reduce((sum, s) => sum + s.average, 0);
        const avgTechScore = parseFloat((totalTechScore / totalStudents).toFixed(1));

        const totalEnglishScore = students.reduce((sum, s) => sum + s.englishScore, 0);
        const avgEnglishScore = parseFloat((totalEnglishScore / totalStudents).toFixed(1));
        
        const passFailData = [
            { name: t.pass, value: passedStudents, color: '#62B766' },
            { name: t.fail, value: totalStudents - passedStudents, color: '#E77373' }
        ];

        const categoryScores: { [key:string]: number[] } = {
            'Foundational Sciences': [], 'Engineering Core': [], 'Industrial Applications': [], 'Safety & Management': []
        };
        students.forEach(student => {
            student.grades.forEach(grade => {
                for (const category in subjectCategories) {
                    if (subjectCategories[category].includes(grade.subject)) {
                        categoryScores[category].push(grade.score);
                        return;
                    }
                }
            });
        });

        const avgCategoryScores = Object.entries(categoryScores).map(([name, scores]) => ({
            name: name.replace(/ /g, '\n'), // Add line breaks for better display in radar chart
            average: scores.length > 0 ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0,
        }));


        const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const cefrDistribution = cefrLevels.map(level => ({
            name: level,
            count: students.filter(s => s.cefr === level).length
        }));
        
        const combinedAverageBins = [0, 60, 70, 80, 90, 101]; // Bins for <60, 60-69, 70-79, 80-89, 90-100
        const combinedAverageDistribution = combinedAverageBins.slice(0, -1).map((min, i) => {
            const max = combinedAverageBins[i+1] - 1;
            const name = min === 0 ? `< 60` : `${min}-${max === 100 ? '100' : max}`;
            const count = students.filter(s => s.combinedAverage >= min && s.combinedAverage < combinedAverageBins[i+1]).length;
            return { name, count };
        });

        return { totalStudents, passRate, avgTechScore, avgEnglishScore, cefrDistribution, combinedAverageDistribution, passFailData, avgCategoryScores };
    }, [students, t]);

     const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const color = data.payload.color;
            return (
                <div style={tooltipStyle} className="text-sm">
                    <div className="flex items-center mb-1">
                         <div style={{ width: 10, height: 10, background: color, marginRight: 8, borderRadius: '2px' }}></div>
                        <span className="font-bold">{data.name}</span>
                    </div>
                    <p>{`${data.value} ${t.candidates}`}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="bg-white/50 dark:bg-eerie-black-800/50 p-6 rounded-xl shadow-lg border border-slate-gray/20">
            <h2 className="text-2xl font-bold mb-6 text-eerie-black dark:text-white">{t.dashboardTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title={t.totalStudents} value={stats.totalStudents} />
                <StatCard title={t.passRate} value={stats.passRate} />
                <StatCard title={t.techAverage} value={stats.avgTechScore} />
                <StatCard title={t.avgEnglishScore} value={stats.avgEnglishScore} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{t.passRate}</h3>
                    <div className="h-80 bg-white dark:bg-eerie-black-800 p-2 rounded-lg shadow border border-slate-gray/20">
                        <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                 <defs>
                                    <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#62B766" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#4da255" stopOpacity={1} />
                                    </linearGradient>
                                    <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#E77373" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#D95C5C" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <Pie data={stats.passFailData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" paddingAngle={5} labelLine={false}>
                                    {stats.passFailData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.name === t.pass ? "url(#passGradient)" : "url(#failGradient)"} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={<CustomPieTooltip />}
                                />
                                <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}} layout="vertical" verticalAlign="middle" align={language === 'ar' ? 'left' : 'right'} />
                                <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-eerie-black dark:fill-white">
                                    {stats.passRate}
                                </text>
                                 <text x="50%" y="50%" dy="1.5em" textAnchor="middle" className="text-sm fill-slate-gray dark:fill-slate-gray/80">
                                    {t.passRate}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{t.cefrDistribution}</h3>
                    <div className="h-80 bg-white dark:bg-eerie-black-800 p-4 rounded-lg shadow border border-slate-gray/20">
                       <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.cefrDistribution} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                                <defs>
                                    {Object.keys(cefrColors).map(level => (
                                        <linearGradient key={`grad-${level}`} id={`cefrGradient-${level}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={cefrColors[level]} stopOpacity={0.8} />
                                            <stop offset="100%" stopColor={cefrColors[level]} stopOpacity={1} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(112, 127, 152, 0.2)" />
                                <XAxis dataKey="name" stroke="#707F98" />
                                <YAxis stroke="#707F98" allowDecimals={false} />
                                <Tooltip content={<CustomCefrTooltip />} cursor={{ fill: 'rgba(112, 127, 152, 0.1)' }} />
                                <Bar dataKey="count" name={t.candidates}>
                                    {stats.cefrDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#cefrGradient-${entry.name})`} />
                                    ))}
                                    <LabelList dataKey="count" position="top" className="fill-slate-gray dark:fill-slate-gray/70 text-sm" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{t.avgScores}</h3>
                    <div className="h-80 bg-white dark:bg-eerie-black-800 p-2 rounded-lg shadow border border-slate-gray/20">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.avgCategoryScores}>
                                <PolarGrid stroke="rgba(112, 127, 152, 0.2)" />
                                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#707F98' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ stroke: '#B5D5BB', strokeWidth: 1, fill: 'rgba(181, 213, 187, 0.1)' }}
                                    content={<CustomRadarTooltip />}
                                />
                                <Radar name={t.average} dataKey="average" stroke="#62B766" fill="#62B766" fillOpacity={0.6} activeDot={{ r: 8, stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2, fill: '#62B766' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{t.overallScoreDistribution}</h3>
                    <div className="h-80 bg-white dark:bg-eerie-black-800 p-4 rounded-lg shadow border border-slate-gray/20">
                       <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.combinedAverageDistribution} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="overallScoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#85c790" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4da255" stopOpacity={1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(112, 127, 152, 0.2)" />
                                <XAxis dataKey="name" stroke="#707F98" />
                                <YAxis allowDecimals={false} stroke="#707F98" />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(112, 127, 152, 0.1)' }}/>
                                <Bar dataKey="count" name={t.candidates} fill="url(#overallScoreGradient)">
                                    <LabelList dataKey="count" position="top" className="fill-slate-gray dark:fill-slate-gray/70 text-sm" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;