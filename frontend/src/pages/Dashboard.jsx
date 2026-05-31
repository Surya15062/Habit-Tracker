import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import HabitCard from '../components/HabitCard';
import { Plus, CheckSquare } from 'lucide-react';

// ── localStorage helpers ──────────────────────────────────────────────────────
const HABITS_KEY = 'habit_habits';
const PROGRESS_KEY = 'habit_progress';

function loadHabits() {
    try { return JSON.parse(localStorage.getItem(HABITS_KEY)) || []; }
    catch { return []; }
}

function saveHabits(habits) {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
    catch { return {}; }
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const today = useMemo(() => getTodayStr(), []);

    const [habits, setHabits] = useState(loadHabits);
    // progress: { [habitId]: { [dateStr]: boolean } }
    const [progress, setProgress] = useState(loadProgress);

    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newFrequency, setNewFrequency] = useState('daily');

    // Sync to localStorage whenever data changes
    useEffect(() => { saveHabits(habits); }, [habits]);
    useEffect(() => { saveProgress(progress); }, [progress]);

    // Today's completion map: { [habitId]: boolean }
    const todayProgress = useMemo(() => {
        const map = {};
        habits.forEach(h => {
            map[h.id] = !!(progress[h.id] && progress[h.id][today]);
        });
        return map;
    }, [habits, progress, today]);

    const toggleProgress = useCallback((habitId, completed) => {
        setProgress(prev => ({
            ...prev,
            [habitId]: {
                ...(prev[habitId] || {}),
                [today]: completed,
            }
        }));
    }, [today]);

    const addHabit = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const newHabit = {
            id: Date.now(),
            title: newTitle.trim(),
            frequency: newFrequency,
            created_at: new Date().toISOString(),
        };
        setHabits(prev => [...prev, newHabit]);
        setNewTitle('');
        setNewFrequency('daily');
        setShowAdd(false);
    };

    const deleteHabit = (habitId) => {
        if (!confirm('Delete this habit?')) return;
        setHabits(prev => prev.filter(h => h.id !== habitId));
        setProgress(prev => {
            const updated = { ...prev };
            delete updated[habitId];
            return updated;
        });
    };

    const completedCount = Object.values(todayProgress).filter(Boolean).length;
    const progressPercentage = habits.length
        ? Math.round((completedCount / habits.length) * 100)
        : 0;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>

            {/* Greeting */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                        Hello, {user?.name}! 👋
                    </h1>
                    <p style={{ color: '#888' }}>Here&apos;s your habit tracking overview for today.</p>
                </div>

                {/* Progress ring */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#1c1c1c', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '0.25rem' }}>Today&apos;s Progress</p>
                        <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#b2f042' }}>
                            {completedCount} <span style={{ fontSize: '1rem', color: '#555', fontWeight: '400' }}>/ {habits.length}</span>
                        </p>
                    </div>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: `conic-gradient(#b2f042 ${progressPercentage * 3.6}deg, #222 0deg)` }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>{progressPercentage}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Habits list */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '600' }}>Your Habits</h2>
                            <button
                                id="add-habit-btn"
                                onClick={() => setShowAdd(!showAdd)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(178,240,66,0.1)', color: '#b2f042', border: '1px solid rgba(178,240,66,0.2)', padding: '0.5rem 1rem', borderRadius: '0.6rem', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = '#b2f042'; e.currentTarget.style.color = '#000'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(178,240,66,0.1)'; e.currentTarget.style.color = '#b2f042'; }}
                            >
                                <Plus size={16} /> Add Habit
                            </button>
                        </div>

                        {showAdd && (
                            <form onSubmit={addHabit} style={{ display: 'flex', gap: '0.75rem', background: '#1c1c1c', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    placeholder="E.g., Read 20 pages"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                    autoFocus
                                    style={{ flex: '1', minWidth: '180px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#fff', outline: 'none' }}
                                />
                                <select
                                    value={newFrequency}
                                    onChange={e => setNewFrequency(e.target.value)}
                                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#fff', outline: 'none' }}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="custom">Custom</option>
                                </select>
                                <button type="submit" style={{ background: '#b2f042', color: '#000', fontWeight: '700', padding: '0.7rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                                    Save
                                </button>
                            </form>
                        )}

                        {habits.length === 0 ? (
                            <div style={{ background: '#1c1c1c', borderRadius: '1rem', padding: '3rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)' }}>
                                <p style={{ color: '#666', marginBottom: '1rem' }}>You haven&apos;t added any habits yet.</p>
                                <button onClick={() => setShowAdd(true)} style={{ background: '#b2f042', color: '#000', fontWeight: '700', padding: '0.6rem 1.5rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Plus size={16} /> Create first habit
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                {habits.map(habit => (
                                    <div key={habit.id} style={{ position: 'relative' }}>
                                        <HabitCard
                                            habit={habit}
                                            isCompletedForToday={todayProgress[habit.id]}
                                            onToggleProgress={toggleProgress}
                                        />
                                        <button
                                            onClick={() => deleteHabit(habit.id)}
                                            style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem', fontSize: '0.75rem', color: 'rgba(239,68,68,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseOver={e => e.target.style.color = 'rgb(239,68,68)'}
                                            onMouseOut={e => e.target.style.color = 'rgba(239,68,68,0.4)'}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Today's Checklist */}
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.25rem' }}>Today&apos;s Checklist</h2>
                        <div style={{ background: '#1c1c1c', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {habits.length === 0 ? (
                                <p style={{ color: '#555', fontSize: '0.875rem', textAlign: 'center', fontStyle: 'italic', padding: '1rem 0' }}>No tasks for today.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {habits.map(habit => (
                                        <label key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={!!todayProgress[habit.id]}
                                                onChange={(e) => toggleProgress(habit.id, e.target.checked)}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{ width: '22px', height: '22px', borderRadius: '5px', border: `2px solid ${todayProgress[habit.id] ? '#b286fd' : 'rgba(255,255,255,0.2)'}`, background: todayProgress[habit.id] ? '#b286fd' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                                                {todayProgress[habit.id] && <CheckSquare size={14} color="#fff" />}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', color: todayProgress[habit.id] ? '#555' : '#ccc', textDecoration: todayProgress[habit.id] ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                                                {habit.title}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {progressPercentage === 100 && habits.length > 0 && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(178,240,66,0.08)', border: '1px solid rgba(178,240,66,0.2)', borderRadius: '0.75rem', textAlign: 'center' }}>
                                    <p style={{ color: '#b2f042', fontWeight: '600', fontSize: '0.875rem' }}>🎉 You crushed it today!</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
