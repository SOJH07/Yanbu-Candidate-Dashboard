

import React, { useMemo } from 'react';
import { Student, Translations, Language } from '../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, LabelList, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
    Legend, Sankey, ScatterChart, Scatter, ReferenceLine, ZAxis, Label 
} from 'recharts';

// --- SHARED CONFIG & HELPERS ---

const subjectCategories: { [key: string]: string[] } = {
    'Foundational Sciences': ['Calculus', 'General Chemistry', 'General Physics'],
    'Engineering Core': ['Applied Statics', 'Applied Statistics', 'Applied Thermodynamics', 'Materials Technology'],
    'Industrial Applications': ['Industrial Electricity', 'Machining Processes', 'Plant Maintenance'],
    'Safety & Management': ['H&S', 'Industrial Safety', 'Industrial Supervision'],
};

const cefrColors: { [key: string]: string } = {
    'A1': '#e2f3e4', 'A2': '#c9e8cd',
    'B1': '#a9d9b1', 'B2': '#85c790',
    'C1': '#62B766', 'C2': '#4da255',
    'default': '#707F98'
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

const ChartCard: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{title}</h3>
        <div className="h-96">
            {children}
        </div>
    </div>
);

// --- ANALYTICS SUB-COMPONENTS ---

const TalentMatrix: React.FC<{ students: Student[], t: Translations, language: Language }> = ({ students, t, language }) => {
    
    const data = useMemo(() => {
        return students.map(s => ({
            x: s.average,
            y: s.englishScore,
            name: `${s.firstName} ${s.lastName}`,
            cefr: s.cefr
        }));
    }, [students]);

    const avgTech = useMemo(() => students.length > 0 ? students.reduce((sum, s) => sum + s.average, 0) / students.length : 0, [students]);
    const avgEnglish = useMemo(() => students.length > 0 ? students.reduce((sum, s) => sum + s.englishScore, 0) / students.length : 0, [students]);
    
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={tooltipStyle} className="text-sm">
                    <p className="font-bold">{data.name}</p>
                    <p>{t.techAverage}: {data.x.toFixed(1)}</p>
                    <p>{t.englishScore}: {data.y.toFixed(1)}</p>
                    <p>{t.cefr}: <span style={{ color: cefrColors[data.cefr] || cefrColors.default, fontWeight: 'bold' }}>{data.cefr}</span></p>
                </div>
            );
        }
        return null;
    };

    const QuadrantLabel: React.FC<{ text: string, position: string}> = ({ text, position }) => (
        <div className={`absolute ${position} p-2 text-xs font-bold text-slate-gray/50 dark:text-slate-gray/40 uppercase tracking-wider`}>{text}</div>
    );

    const legendLevels = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];

    return (
        <ChartCard title={t.talentMatrix}>
            <div className="relative w-full h-full">
                <QuadrantLabel text={t.emergingTalent} position={`top-0 ${language === 'ar' ? 'right-0' : 'left-0'}`} />
                <QuadrantLabel text={t.highPotentials} position={`top-0 ${language === 'ar' ? 'left-0' : 'right-0'}`} />
                <QuadrantLabel text={t.developmentFocus} position={`bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'}`} />
                <QuadrantLabel text={t.technicalExperts} position={`bottom-0 ${language === 'ar' ? 'left-0' : 'right-0'}`} />
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 30, right: 30, bottom: 60, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(112, 127, 152, 0.2)" />
                        <XAxis type="number" dataKey="x" name={t.techAverage} unit="" domain={[0, 100]} stroke="#707F98" tick={{ fontSize: 12 }}>
                            <Label value={t.techAverage} offset={-40} position="insideBottom" className="fill-slate-gray dark:fill-anti-flash-white/80" />
                        </XAxis>
                        <YAxis type="number" dataKey="y" name={t.englishScore} unit="" domain={[0, 100]} stroke="#707F98" tick={{ fontSize: 12 }}>
                             <Label value={t.englishScore} angle={-90} offset={-35} position="insideLeft" style={{ textAnchor: 'middle' }} className="fill-slate-gray dark:fill-anti-flash-white/80" />
                        </YAxis>
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <ReferenceLine x={avgTech} stroke="#707F98" strokeDasharray="4 4">
                             <Label value={`Avg: ${avgTech.toFixed(1)}`} position="insideBottomLeft" fill="#707F98" fontSize={12} offset={10}/>
                        </ReferenceLine>
                        <ReferenceLine y={avgEnglish} stroke="#707F98" strokeDasharray="4 4">
                             <Label value={`Avg: ${avgEnglish.toFixed(1)}`} position="insideTopLeft" fill="#707F98" fontSize={12} offset={10}/>
                        </ReferenceLine>
                        <ZAxis type="number" range={[150, 150]} />
                        {legendLevels.map(level => {
                            const levelData = data.filter(d => d.cefr === level);
                            if (levelData.length === 0) return null;
                            return (
                                <Scatter
                                    key={level}
                                    name={level}
                                    data={levelData}
                                    fill={cefrColors[level] || cefrColors.default}
                                    stroke="rgba(255,255,255,0.7)"
                                    fillOpacity={0.8}
                                    zAxisId={0}
                                />
                            );
                        })}
                        <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}/>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
};

const SubjectPerformance: React.FC<{ students: Student[], t: Translations }> = ({ students, t }) => {
    const performanceData = useMemo(() => {
        const subjectScores: { [key: string]: number[] } = {};
        students.forEach(s => s.grades.forEach(g => {
            if (!subjectScores[g.subject]) subjectScores[g.subject] = [];
            subjectScores[g.subject].push(g.score);
        }));

        const subjectAverages: { [key: string]: number } = {};
        Object.keys(subjectScores).forEach(subject => {
            const scores = subjectScores[subject];
            subjectAverages[subject] = scores.reduce((a, b) => a + b, 0) / scores.length;
        });

        const result: { [category: string]: { subjects: { subject: string; average: number }[], categoryAverage: number } } = {};
        Object.keys(subjectCategories).forEach(category => {
            const subjects = subjectCategories[category];
            const categorySubjectData = subjects.map(subject => ({
                subject,
                average: subjectAverages[subject] || 0
            })).filter(s => s.average > 0)
            .sort((a,b) => a.average - b.average);

            if (categorySubjectData.length > 0) {
                const categoryTotal = categorySubjectData.reduce((sum, s) => sum + s.average, 0);
                result[category] = {
                    subjects: categorySubjectData,
                    categoryAverage: categoryTotal / categorySubjectData.length
                };
            }
        });

        return result;
    }, [students]);
    
    const CustomReferenceLabel: React.FC<any> = ({ value, viewBox, color }) => {
        const { x } = viewBox;
        // The viewBox y is the top edge of the chart area.
        // We'll render our custom label just above it.
        const yOffset = -8;
        const textWidth = String(value).length * 6 + 10; // Estimate width for padding
        
        return (
            <g transform={`translate(${x}, ${viewBox.y})`}>
                <rect 
                    x={-textWidth / 2} 
                    y={yOffset - 13} 
                    width={textWidth} 
                    height={18} 
                    rx="4" 
                    ry="4"
                    className="fill-white/80 dark:fill-eerie-black/80 backdrop-blur-sm"
                    stroke={color}
                    strokeOpacity={0.5}
                />
                <text 
                    x={0} 
                    y={yOffset - 4} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="font-semibold"
                    fontSize={11}
                    fill={color}
                >
                    {value}
                </text>
            </g>
        );
    };

    const CustomSubjectTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div style={tooltipStyle} className="text-sm">
                    <p className="font-semibold mb-1">{label}</p>
                    <p>{`${data.name}: ${data.value.toFixed(1)}`}</p>
                </div>
            );
        }
        return null;
    };


    return (
         <div className="bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20">
            <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{t.subjectPerformance}</h3>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Object.keys(performanceData).map((category) => {
                    const data = performanceData[category];
                    const chartHeight = data.subjects.length * 35 + 60;
                    return (
                        <div key={category} className="p-4 rounded-lg bg-anti-flash-white/50 dark:bg-eerie-black/50 border border-slate-gray/20">
                            <h4 className="font-semibold text-eerie-black dark:text-white text-base mb-2">{category}</h4>
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <ScatterChart
                                    data={data.subjects}
                                    layout="vertical"
                                    margin={{ top: 30, right: 30, bottom: 20, left: 120 }}
                                >
                                    <CartesianGrid stroke="rgba(112, 127, 152, 0.1)" horizontal={false} />
                                    <XAxis type="number" dataKey="average" name={t.average} domain={[0, 100]} tick={{ fontSize: 12, fill: '#707F98' }} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="subject" 
                                        name={t.subject} 
                                        tick={{ fontSize: 12, fill: '#707F98' }} 
                                        interval={0}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={<CustomSubjectTooltip />}
                                    />
                                    <ReferenceLine x={60} stroke="#E77373" strokeDasharray="3 3">
                                        <Label value={`${t.pass}: 60`} position="bottom" fill="#E77373" fontSize={12} offset={5} />
                                    </ReferenceLine>
                                    <ReferenceLine x={data.categoryAverage} stroke="#62B766" strokeDasharray="3 3">
                                         <Label 
                                            position="top"
                                            content={<CustomReferenceLabel color="#3d8244" />}
                                            value={`${t.average}: ${data.categoryAverage.toFixed(1)}`}
                                         />
                                    </ReferenceLine>
                                    <ZAxis type="number" range={[150, 150]} />
                                    <Scatter name={t.average} zAxisId={0}>
                                        {data.subjects.map((entry, index) => {
                                            const score = entry.average;
                                            let color = '#707F98';
                                            if (score < 60) color = '#E77373';
                                            else if (score > 85) color = '#4da255';
                                            return <Cell key={`cell-${index}`} fill={color} />;
                                        })}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    secondaryValue?: string; 
    secondaryLabel?: string; 
    gaugeValue?: number;
    gaugeColor?: string;
}> = ({ title, value, secondaryValue, secondaryLabel, gaugeValue, gaugeColor = 'bg-primary-500' }) => (
    <div className="bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20 flex flex-col justify-between min-h-[160px]">
        <div>
            <h3 className="text-base font-medium text-slate-gray">{title}</h3>
            <p className="mt-1 text-4xl font-bold text-eerie-black dark:text-white">{value}</p>
        </div>
        { (secondaryValue || gaugeValue !== undefined) && <div className="mt-4">
            {secondaryValue && secondaryLabel && (
                <div className="text-sm">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{secondaryValue}</span>
                    <span className="text-slate-gray ml-2">{secondaryLabel}</span>
                </div>
            )}
            {gaugeValue !== undefined && (
                <div className="w-full bg-anti-flash-white dark:bg-eerie-black rounded-full h-2 mt-2 shadow-inner">
                    <div
                        className={`${gaugeColor} h-2 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${gaugeValue}%` }}
                    />
                </div>
            )}
        </div> }
    </div>
);

interface DashboardAnalyticsViewProps {
    students: Student[];
    t: Translations;
    language: Language;
}

const DashboardAnalyticsView: React.FC<DashboardAnalyticsViewProps> = ({ students, t, language }) => {

    const stats = useMemo(() => {
        if (students.length === 0) {
            return {
                totalStudents: 0, passRate: '0%', avgTechScore: 0, avgEnglishScore: 0,
                cefrDistribution: [], combinedAverageDistribution: [], passFailData: [], avgCategoryScores: [],
                passRateTop50: '0%',
            };
        }

        const totalStudents = students.length;
        const passedStudents = students.filter(s => s.status === 'Pass').length;
        const passRate = `${((passedStudents / totalStudents) * 100).toFixed(1)}%`;
        const totalTechScore = students.reduce((sum, s) => sum + s.average, 0);
        const avgTechScore = parseFloat((totalTechScore / totalStudents).toFixed(1));
        const totalEnglishScore = students.reduce((sum, s) => sum + s.englishScore, 0);
        const avgEnglishScore = parseFloat((totalEnglishScore / totalStudents).toFixed(1));

        const top50PercentCount = Math.ceil(students.length / 2);
        const top50Students = students.slice(0, top50PercentCount);
        const passedTop50 = top50Students.filter(s => s.status === 'Pass').length;
        const passRateTop50 = top50Students.length > 0 ? `${((passedTop50 / top50Students.length) * 100).toFixed(1)}%` : '0%';

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
            name: name.replace(/ /g, '\n'),
            average: scores.length > 0 ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0,
        }));
        const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const cefrDistribution = cefrLevels.map(level => ({
            name: level,
            count: students.filter(s => s.cefr === level).length
        }));
        const combinedAverageBins = [0, 60, 70, 80, 90, 101];
        const combinedAverageDistribution = combinedAverageBins.slice(0, -1).map((min, i) => {
            const max = combinedAverageBins[i+1] - 1;
            const name = min === 0 ? `< 60` : `${min}-${max === 100 ? '100' : max}`;
            const count = students.filter(s => s.combinedAverage >= min && s.combinedAverage < combinedAverageBins[i+1]).length;
            return { name, count };
        });

        return { 
            totalStudents, passRate, avgTechScore, avgEnglishScore, cefrDistribution, combinedAverageDistribution, passFailData, avgCategoryScores, passRateTop50
        };
    }, [students, t]);
    
    // --- Chart Tooltip Components ---
    const CustomRadarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const color = payload[0].stroke;
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


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t.totalStudents} value={stats.totalStudents} />
                <StatCard 
                    title={t.passRate} 
                    value={stats.passRate}
                    secondaryValue={stats.passRateTop50}
                    secondaryLabel={t.passRateTop50}
                />
                <StatCard 
                    title={t.techAverage} 
                    value={stats.avgTechScore}
                    gaugeValue={stats.avgTechScore}
                    gaugeColor="bg-primary-500"
                />
                <StatCard 
                    title={t.avgEnglishScore} 
                    value={stats.avgEnglishScore}
                    gaugeValue={stats.avgEnglishScore}
                    gaugeColor="bg-secondary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TalentMatrix students={students} t={t} language={language} />
                <ChartCard title={t.cefrDistribution}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.cefrDistribution} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
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
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <ChartCard title={t.avgScores}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.avgCategoryScores}>
                            <PolarGrid stroke="rgba(112, 127, 152, 0.2)" />
                            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#707F98' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Tooltip cursor={{ stroke: '#B5D5BB', strokeWidth: 1, fill: 'rgba(181, 213, 187, 0.1)' }} content={<CustomRadarTooltip />}/>
                            <Radar name={t.average} dataKey="average" stroke="#62B766" fill="#62B766" fillOpacity={0.6} activeDot={{ r: 8, stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2, fill: '#62B766' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>
                 <ChartCard title={t.overallScoreDistribution}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.combinedAverageDistribution} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
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
                </ChartCard>
            </div>
            
            <SubjectPerformance students={students} t={t} />
        </div>
    );
};

export default DashboardAnalyticsView;