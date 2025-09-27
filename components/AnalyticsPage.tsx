


import React, { useMemo } from 'react';
import { Student, Translations, Language, Grade } from '../types';
import { Sankey, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ZAxis, Label, Cell, Legend } from 'recharts';

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

const KeyInsights: React.FC<{ students: Student[], t: Translations }> = ({ students, t }) => {
    const insights = useMemo(() => {
        if (students.length === 0) {
            return { passRateDifference: '0', bestCategoryName: t.noData, top10Percentage: '0' };
        }

        const c1Students = students.filter(s => s.cefr === 'C1');
        const b1Students = students.filter(s => s.cefr === 'B1');

        const c1PassRate = c1Students.length > 0 ? (c1Students.filter(s => s.status === 'Pass').length / c1Students.length) * 100 : 0;
        const b1PassRate = b1Students.length > 0 ? (b1Students.filter(s => s.status === 'Pass').length / b1Students.length) * 100 : 0;
        
        const passRateDifference = b1PassRate > 0 ? ((c1PassRate / b1PassRate) - 1) * 100 : (c1PassRate > 0 ? Infinity : 0);

        const categoryScores: { [key: string]: number[] } = {};
        Object.keys(subjectCategories).forEach(cat => categoryScores[cat] = []);
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
        
        let bestCategory = { name: '', avg: 0 };
        Object.entries(categoryScores).forEach(([name, scores]) => {
            if (scores.length > 0) {
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                if (avg > bestCategory.avg) {
                    bestCategory = { name, avg };
                }
            }
        });

        const top10 = students.filter(s => s.rank <= 10);
        const top10B2Plus = top10.filter(s => ['B2', 'C1', 'C2'].includes(s.cefr)).length;
        const top10Percentage = top10.length > 0 ? (top10B2Plus / top10.length) * 100 : 0;

        return {
            passRateDifference: isFinite(passRateDifference) ? passRateDifference.toFixed(0) : 'N/A',
            bestCategoryName: bestCategory.name,
            top10Percentage: top10Percentage.toFixed(0),
        };

    }, [students, t.noData]);

    const Insight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <li className="flex items-start gap-3 p-3 bg-anti-flash-white/50 dark:bg-eerie-black/50 rounded-lg border border-slate-gray/20">
             <svg className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <span className="text-sm text-eerie-black dark:text-gray-300">{children}</span>
        </li>
    );

    return (
        <div className="bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20">
            <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{t.keyInsights}</h3>
            <ul className="space-y-3">
                <Insight>{t.insight1_part1} <strong className="text-primary-500">{insights.passRateDifference || 0}</strong>{t.insight1_part2}</Insight>
                <Insight>{t.insight2_part1}<strong className="text-primary-500">{insights.bestCategoryName || t.noData}</strong>{t.insight2_part2}</Insight>
                <Insight><strong className="text-primary-500">{insights.top10Percentage || 0}%</strong> {t.insight3_part1}</Insight>
            </ul>
        </div>
    );
}

const CustomSankeyNode: React.FC<any> = ({ x, y, width, height, payload, sankeyNodeColors, language }) => {
    const isRtl = language === 'ar';
    const textX = isRtl ? x - 15 : x + width + 15;
    const textAnchor = isRtl ? 'end' : 'start';
    
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={sankeyNodeColors[payload.name] || cefrColors.default} rx={3} ry={3} />
            <text x={textX} y={y + height / 2} textAnchor={textAnchor} dominantBaseline="middle" className="fill-slate-gray dark:fill-slate-gray/80 text-sm font-medium">
                {`${payload.name} (${payload.value})`}
            </text>
        </g>
    );
};

const SankeyChart: React.FC<{ students: Student[], t: Translations, language: Language }> = ({ students, t, language }) => {
    const sankeyData = useMemo(() => {
        const cefrLevels = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
        const results = [t.pass, t.fail];
        
        const nodes = [
            ...cefrLevels.map(name => ({ name })),
            ...results.map(name => ({ name }))
        ];

        const nodeMap = new Map(nodes.map((node, i) => [node.name, i]));
        
        const links: { source: number, target: number, value: number }[] = [];

        cefrLevels.forEach(level => {
            const levelStudents = students.filter(s => s.cefr === level);
            if (levelStudents.length > 0) {
                const passCount = levelStudents.filter(s => s.status === 'Pass').length;
                const failCount = levelStudents.length - passCount;
                
                if (passCount > 0) {
                    links.push({ source: nodeMap.get(level)!, target: nodeMap.get(t.pass)!, value: passCount });
                }
                if (failCount > 0) {
                    links.push({ source: nodeMap.get(level)!, target: nodeMap.get(t.fail)!, value: failCount });
                }
            }
        });

        return { nodes, links };
    }, [students, t.pass, t.fail]);

    const passFailColors = { [t.pass]: '#4da255', [t.fail]: '#E77373' };
    const sankeyNodeColors = { ...cefrColors, ...passFailColors };
    
    return (
        <ChartCard title={t.candidateFlow}>
            <ResponsiveContainer width="100%" height="100%">
                <Sankey
                    data={sankeyData}
                    nodePadding={50}
                    margin={{ top: 20, right: 150, bottom: 20, left: 150 }}
                    link={{ stroke: 'url(#sankeyLinkGradient)', strokeOpacity: 1 }}
                    node={<CustomSankeyNode sankeyNodeColors={sankeyNodeColors} language={language} />}
                >
                     <defs>
                        <linearGradient id="sankeyLinkGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#a9d9b1" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#62B766" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                     <Tooltip 
                        contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) => [`${value} ${t.candidates}`, name.replace(' -> ', ' → ')]}
                    />
                </Sankey>
            </ResponsiveContainer>
        </ChartCard>
    );
};


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
        <div className={`absolute ${position} p-2 text-xs font-bold text-slate-gray/60 dark:text-slate-gray/50 uppercase tracking-wider`}>{text}</div>
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
                    <ScatterChart margin={{ top: 30, right: 30, bottom: 50, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(112, 127, 152, 0.2)" />
                        <XAxis type="number" dataKey="x" name={t.techAverage} unit="" domain={[0, 100]} stroke="#707F98">
                            <Label value={t.techAverage} offset={-30} position="insideBottom" className="fill-slate-gray dark:fill-slate-gray/80" />
                        </XAxis>
                        <YAxis type="number" dataKey="y" name={t.englishScore} unit="" domain={[0, 100]} stroke="#707F98">
                             <Label value={t.englishScore} angle={-90} offset={-25} position="insideLeft" style={{ textAnchor: 'middle' }} className="fill-slate-gray dark:fill-slate-gray/80" />
                        </YAxis>
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <ReferenceLine x={avgTech} stroke="#E77373" strokeDasharray="4 4">
                             <Label value={`${t.average} (${avgTech.toFixed(1)})`} position="top" fill="#E77373" fontSize={11} offset={10}/>
                        </ReferenceLine>
                        <ReferenceLine y={avgEnglish} stroke="#E77373" strokeDasharray="4 4">
                             <Label value={`${t.average} (${avgEnglish.toFixed(1)})`} position="right" fill="#E77373" fontSize={11} offset={10}/>
                        </ReferenceLine>
                        <ZAxis type="number" range={[80, 80]} />
                        {/* FIX: Replaced single Scatter with Cells and manual legend with multiple Scatter components to let recharts generate the legend automatically, avoiding the payload prop issue. */}
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
                        <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ bottom: 0, fontSize: '12px' }}/>
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

    return (
         <div className="bg-white dark:bg-eerie-black-800 p-6 rounded-xl shadow-lg border border-slate-gray/20">
            <h3 className="text-lg font-semibold mb-4 text-eerie-black dark:text-white">{t.subjectPerformance}</h3>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Object.keys(performanceData).map((category) => {
                    const data = performanceData[category];
                    const chartHeight = data.subjects.length * 35 + 40;
                    return (
                        <div key={category} className="p-4 rounded-lg bg-anti-flash-white/50 dark:bg-eerie-black/50 border border-slate-gray/20">
                            <div className="flex justify-between items-baseline mb-2">
                                <h4 className="font-semibold text-eerie-black dark:text-white text-base">{category}</h4>
                                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">Avg: {data.categoryAverage.toFixed(1)}</span>
                            </div>
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <ScatterChart
                                    data={data.subjects}
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, bottom: 10, left: 120 }}
                                >
                                    <CartesianGrid stroke="rgba(112, 127, 152, 0.1)" horizontal={false} />
                                    <XAxis type="number" dataKey="average" name={t.average} domain={[0, 100]} tick={{ fontSize: 10, fill: '#707F98' }} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="subject" 
                                        name="Subject" 
                                        width={120} 
                                        tick={{ fontSize: 11, fill: '#707F98', width: 140 }} 
                                        interval={0}
                                    />
                                    <Tooltip 
                                        cursor={{ strokeDasharray: '3 3' }} 
                                        contentStyle={tooltipStyle}
                                        formatter={(value: string | number) => typeof value === 'number' ? value.toFixed(1) : value}
                                    />
                                    <ReferenceLine x={60} stroke="#E77373" strokeDasharray="3 3">
                                        <Label value={t.pass} position="insideTopLeft" fill="#E77373" fontSize={11} offset={-2} />
                                    </ReferenceLine>
                                    <ReferenceLine x={data.categoryAverage} stroke="#62B766" strokeDasharray="3 3">
                                         <Label value={`${t.average} (${data.categoryAverage.toFixed(1)})`} position="top" fill="#62B766" fontSize={11} offset={5} />
                                    </ReferenceLine>
                                    <ZAxis type="number" range={[100, 100]} />
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

interface AnalyticsPageProps {
    students: Student[];
    t: Translations;
    language: Language;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ students, t, language }) => {
    return (
        <div className="space-y-8">
            <KeyInsights students={students} t={t} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SankeyChart students={students} t={t} language={language} />
                <TalentMatrix students={students} t={t} language={language} />
            </div>
             <SubjectPerformance students={students} t={t} />
        </div>
    );
};

export default AnalyticsPage;