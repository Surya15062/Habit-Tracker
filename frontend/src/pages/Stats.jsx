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
            <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '0.6rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <p style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontSize: '0.875rem', color: '#b2f042' }}>{payload[0].value}% Completed</p>
                <p style={{ fontSize: '0.75rem', color: '#777', marginTop: '0.25rem' }}>
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

    const cardStyle = (accent) => ({
        background: 'linear-gradient(135deg, #1c1c1c, #111)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: `1px solid rgba(255,255,255,0.05)`,
        position: 'relative',
        overflow: 'hidden',
    });

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.4rem' }}>Statistics &amp; Progress</h1>
                    <p style={{ color: '#888' }}>Track your long-term success and consistency.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <select
                        value={month}
                        onChange={e => setMonth(parseInt(e.target.value))}
                        style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.6rem 1rem', color: '#fff', outline: 'none' }}
                    >
                        {MONTH_NAMES.map((m, idx) => (
                            <option key={m} value={idx + 1}>{m}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={year}
                        onChange={e => setYear(parseInt(e.target.value))}
                        style={{ width: '90px', background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.6rem 1rem', color: '#fff', outline: 'none' }}
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

                <div style={cardStyle('#b2f042')}>
                    <div style={{ position: 'absolute', right: '-1.5rem', top: '-1.5rem', width: '5rem', height: '5rem', background: 'rgba(178,240,66,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(178,240,66,0.15)', borderRadius: '0.6rem', color: '#b2f042' }}><Calendar size={20} /></div>
                        <span style={{ color: '#888', fontSize: '0.875rem' }}>Monthly Success</span>
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: '700' }}>{monthlyStats.percentage}%</p>
                    <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.25rem' }}>{monthlyStats.completed_days} active days</p>
                </div>

                <div style={cardStyle('#b286fd')}>
                    <div style={{ position: 'absolute', right: '-1.5rem', top: '-1.5rem', width: '5rem', height: '5rem', background: 'rgba(178,134,253,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(178,134,253,0.15)', borderRadius: '0.6rem', color: '#b286fd' }}><Target size={20} /></div>
                        <span style={{ color: '#888', fontSize: '0.875rem' }}>Yearly Success</span>
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: '700' }}>{yearlyCompletion}%</p>
                    <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.25rem' }}>Aggregated over {year}</p>
                </div>

                <div style={cardStyle('#fb923c')}>
                    <div style={{ position: 'absolute', right: '-1.5rem', top: '-1.5rem', width: '5rem', height: '5rem', background: 'rgba(251,146,60,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(251,146,60,0.15)', borderRadius: '0.6rem', color: '#fb923c' }}><Flame size={20} /></div>
                        <span style={{ color: '#888', fontSize: '0.875rem' }}>Current Streak</span>
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: '700' }}>{streak} <span style={{ fontSize: '1rem', fontWeight: '400', color: '#555' }}>days</span></p>
                    <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.25rem' }}>Keep it going!</p>
                </div>

                <div style={{ ...cardStyle(), border: '1px solid rgba(178,240,66,0.15)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(178,240,66,0.03)' }} />
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '0.5rem 0' }}>
                        <Award size={36} color="#b2f042" style={{ marginBottom: '0.5rem' }} />
                        <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Keep It Up!</p>
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Consistency is key to forming lasting habits.</p>
                    </div>
                </div>
            </div>

            {/* Yearly Chart */}
            <div style={{ background: '#1c1c1c', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '4px', height: '1.4rem', background: '#b286fd', borderRadius: '4px', display: 'inline-block' }} />
                    {year} Overview
                </h2>

                {habits.length === 0 ? (
                    <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.9rem' }}>
                        Add some habits on the Dashboard to see statistics here.
                    </div>
                ) : (
                    <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" tickLine={false} axisLine={false} />
                                <YAxis stroke="#555" tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} animationDuration={1200}>
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
