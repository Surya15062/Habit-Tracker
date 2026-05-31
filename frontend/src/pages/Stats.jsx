import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Calendar, Target, Award, Flame } from 'lucide-react';

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadHabits() {
    try { return JSON.parse(localStorage.getItem('habit_habits')) || []; }
    catch { return []; }
}
function loadProgress() {
    try { return JSON.parse(localStorage.getItem('habit_progress')) || {}; }
    catch { return {}; }
}
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card-dark border border-white/10 p-3 rounded-xl shadow-xl">
                <p className="font-bold text-white mb-1">{label}</p>
                <p className="text-sm text-primary font-semibold">
                    {payload[0].value}% Completed
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {payload[0].payload.completed} / {payload[0].payload.total} habits
                </p>
            </div>
        );
    }
    return null;
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    label: PropTypes.string,
    payload: PropTypes.array,
};

CustomTooltip.defaultProps = { active: false, label: '', payload: [] };

// Calculate longest current streak (consecutive days with ≥1 completion)
function calcStreak(habits, progress) {
    if (!habits.length) return 0;
    let streak = 0;
    const d = new Date();
    while (true) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const anyDone = habits.some(h => progress[h.id] && progress[h.id][dateStr]);
        if (!anyDone) break;
        streak++;
        d.setDate(d.getDate() - 1);
    }
    return streak;
}

export default function Stats() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const habits = useMemo(() => loadHabits(), []);
    const progress = useMemo(() => loadProgress(), []);

    // Build yearly chart data from localStorage
    const yearlyStats = useMemo(() => {
        return MONTH_NAMES.map((name, idx) => {
            const m = idx + 1;
            const daysInMonth = new Date(year, m, 0).getDate();
            let completed = 0, total = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                habits.forEach(h => {
                    total++;
                    if (progress[h.id] && progress[h.id][dateStr]) completed++;
                });
            }
            const percentage = total ? Math.round((completed / total) * 100) : 0;
            return { name, percentage, completed, total };
        });
    }, [year, habits, progress]);

    // Monthly stats for selected month
    const monthlyStats = useMemo(() => {
        const daysInMonth = new Date(year, month, 0).getDate();
        let completed = 0, total = 0, daysWithAny = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let dayCompleted = 0;
            habits.forEach(h => {
                total++;
                if (progress[h.id] && progress[h.id][dateStr]) { completed++; dayCompleted++; }
            });
            if (dayCompleted > 0) daysWithAny++;
        }
        const percentage = total ? Math.round((completed / total) * 100) : 0;
        return { percentage, completed_days: daysWithAny, total_days: daysInMonth };
    }, [year, month, habits, progress]);

    const yearlyCompletion = useMemo(() => {
        const total = yearlyStats.reduce((s, i) => s + i.total, 0);
        const done = yearlyStats.reduce((s, i) => s + i.completed, 0);
        return total ? Math.round((done / total) * 100) : 0;
    }, [yearlyStats]);

    const streak = useMemo(() => calcStreak(habits, progress), [habits, progress]);

    return (
        <div className="space-y-8">
            {/* Header section with Year/Month Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Statistics &amp; Progress</h1>
                    <p className="text-sm text-gray-400 mt-1">Track your long-term success and consistency.</p>
                </div>
                <div className="flex space-x-3">
                    <select
                        value={month}
                        onChange={e => setMonth(parseInt(e.target.value))}
                        className="bg-card-dark border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors text-sm text-white cursor-pointer"
                    >
                        {MONTH_NAMES.map((m, idx) => (
                            <option key={m} value={idx + 1}>{m}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={year}
                        onChange={e => setYear(parseInt(e.target.value))}
                        className="w-24 bg-card-dark border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-secondary transition-colors text-sm text-white"
                    />
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Monthly Success */}
                <div className="bg-gradient-to-br from-card-dark to-card-dark/60 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
                    <div className="flex items-center space-x-3 text-gray-400 mb-4">
                        <div className="p-2.5 bg-primary/15 text-primary rounded-xl"><Calendar className="w-5 h-5" /></div>
                        <span className="text-xs uppercase tracking-wider font-bold">Monthly Success</span>
                    </div>
                    <div>
                        <p className="text-4xl font-extrabold text-white">{monthlyStats.percentage}%</p>
                        <p className="text-[11px] text-gray-500 font-semibold mt-1">{monthlyStats.completed_days} Active Days</p>
                    </div>
                </div>

                {/* Yearly Success */}
                <div className="bg-gradient-to-br from-card-dark to-card-dark/60 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-secondary/10 rounded-full blur-xl" />
                    <div className="flex items-center space-x-3 text-gray-400 mb-4">
                        <div className="p-2.5 bg-secondary/15 text-secondary rounded-xl"><Target className="w-5 h-5" /></div>
                        <span className="text-xs uppercase tracking-wider font-bold">Yearly Success</span>
                    </div>
                    <div>
                        <p className="text-4xl font-extrabold text-white">{yearlyCompletion}%</p>
                        <p className="text-[11px] text-gray-500 font-semibold mt-1">Aggregated over {year}</p>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="bg-gradient-to-br from-card-dark to-card-dark/60 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-orange-500/10 rounded-full blur-xl" />
                    <div className="flex items-center space-x-3 text-gray-400 mb-4">
                        <div className="p-2.5 bg-orange-500/15 text-orange-400 rounded-xl"><Flame className="w-5 h-5" /></div>
                        <span className="text-xs uppercase tracking-wider font-bold">Current Streak</span>
                    </div>
                    <div>
                        <p className="text-4xl font-extrabold text-white">
                            {streak} <span className="text-sm text-gray-500 font-normal">days</span>
                        </p>
                        <p className="text-[11px] text-gray-500 font-semibold mt-1">Keep it glowing! 🔥</p>
                    </div>
                </div>

                {/* Motivation Award */}
                <div className="bg-card-dark border border-primary/10 p-6 rounded-2xl relative overflow-hidden flex items-center justify-center text-center shadow-lg">
                    <div className="absolute inset-0 bg-primary/3" />
                    <div className="relative z-10 space-y-1">
                        <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-bold text-white">Keep It Up!</p>
                        <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Consistency is the secret to building habits that last.</p>
                    </div>
                </div>
            </div>

            {/* Yearly Overview Bar Chart Card */}
            <div className="bg-card-dark p-6 rounded-2xl border border-white/5 shadow-xl">
                <h2 className="text-lg font-bold text-white tracking-tight mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-secondary rounded-full" />
                    {year} Overview
                </h2>

                {habits.length === 0 ? (
                    <div className="h-72 flex items-center justify-center text-gray-500 text-sm italic">
                        Create and track habits on the Dashboard to see statistics here.
                    </div>
                ) : (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                <YAxis stroke="#555" tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} animationDuration={1000}>
                                    {yearlyStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percentage > 70 ? '#b2f042' : '#b286fd'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
