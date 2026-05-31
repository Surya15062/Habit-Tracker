import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import HabitCard from '../components/HabitCard';
import { Plus, CheckSquare, Sparkles } from 'lucide-react';

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
    const [progress, setProgress] = useState(loadProgress);

    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newFrequency, setNewFrequency] = useState('daily');

    // Sync to localStorage
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
            frequency: newFrequency.charAt(0).toUpperCase() + newFrequency.slice(1),
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
        <div className="space-y-8">
            {/* Top Banner Row: Greeting + Progress Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Greeting Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-card-dark to-card-dark/60 border border-white/5 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                            Hello, {user?.name}! 👋
                        </h1>
                        <p className="text-gray-400 text-sm max-w-lg">
                            Here&apos;s your habit tracking overview for today. Keep building your streak and stay consistent!
                        </p>
                    </div>
                    <div className="mt-6 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 py-1.5 px-3 rounded-lg w-max border border-primary/10">
                        Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>

                {/* Progress Card */}
                <div className="bg-card-dark border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Today&apos;s Progress</p>
                        <div className="flex items-baseline space-x-1.5">
                            <span className="text-4xl font-extrabold text-primary">{completedCount}</span>
                            <span className="text-gray-500 text-sm font-semibold">/ {habits.length} habits</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            {progressPercentage === 100 && habits.length > 0 
                                ? 'Perfect day! 🎉' 
                                : habits.length === 0 
                                ? 'Create a habit to begin!' 
                                : `${habits.length - completedCount} remaining for today`}
                        </p>
                    </div>

                    {/* Progress Circle Container */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Outer Track */}
                            <circle
                                cx="48"
                                cy="48"
                                r="36"
                                className="stroke-white/5 fill-none"
                                strokeWidth="8"
                            />
                            {/* Active Ring */}
                            <circle
                                cx="48"
                                cy="48"
                                r="36"
                                className="stroke-primary fill-none transition-all duration-500 ease-out"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 36}
                                strokeDashoffset={2 * Math.PI * 36 * (1 - progressPercentage / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-base text-white">
                            {progressPercentage}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Habit List & Today's Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Column 1 & 2: Habits List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Your Habits</h2>
                            <p className="text-xs text-gray-400 mt-1">Manage and track your active routine</p>
                        </div>
                        <button
                            id="add-habit-btn"
                            onClick={() => setShowAdd(!showAdd)}
                            className="flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Habit</span>
                        </button>
                    </div>

                    {/* Add Habit Form Panel */}
                    {showAdd && (
                        <form 
                            onSubmit={addHabit} 
                            className="bg-card-dark p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-stretch shadow-inner"
                        >
                            <input
                                type="text"
                                placeholder="E.g., Read 20 pages"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                required
                                autoFocus
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary text-sm text-white placeholder-gray-500 transition-colors"
                            />
                            <select
                                value={newFrequency}
                                onChange={e => setNewFrequency(e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-primary text-sm text-white px-4 transition-colors cursor-pointer"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="custom">Custom</option>
                            </select>
                            <button 
                                type="submit" 
                                className="bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm cursor-pointer shadow-md shadow-primary/15"
                            >
                                Save Habit
                            </button>
                        </form>
                    )}

                    {/* Habits Cards Grid */}
                    {habits.length === 0 ? (
                        <div className="bg-card-dark rounded-2xl p-16 text-center border border-white/5 border-dashed flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-300 font-semibold">No habits tracked yet</p>
                                <p className="text-xs text-gray-500">Create your first habit to begin building routines.</p>
                            </div>
                            <button 
                                onClick={() => setShowAdd(true)} 
                                className="bg-primary text-black font-bold px-5 py-2.5 rounded-xl inline-flex items-center space-x-2 text-sm hover:bg-primary/90 transition-colors cursor-pointer shadow-md shadow-primary/15"
                            >
                                <Plus className="w-4 h-4" /> 
                                <span>Create first habit</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {habits.map(habit => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    isCompletedForToday={todayProgress[habit.id]}
                                    onToggleProgress={toggleProgress}
                                    onDelete={deleteHabit}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 3: Today's Checklist Panel */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Today&apos;s Checklist</h2>
                        <p className="text-xs text-gray-400 mt-1">Check off habits for today</p>
                    </div>

                    <div className="bg-card-dark p-6 rounded-2xl border border-white/5 shadow-xl space-y-4">
                        {habits.length === 0 ? (
                            <p className="text-gray-500 text-xs text-center italic py-6">No active habits for today.</p>
                        ) : (
                            <div className="space-y-3">
                                {habits.map(habit => (
                                    <label 
                                        key={habit.id} 
                                        className="flex items-center space-x-4 cursor-pointer group p-3 hover:bg-white/30 rounded-xl transition-all duration-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!todayProgress[habit.id]}
                                            onChange={(e) => toggleProgress(habit.id, e.target.checked)}
                                            className="hidden"
                                        />
                                        <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                            todayProgress[habit.id] 
                                                ? 'bg-secondary border-secondary shadow-md shadow-secondary/15 scale-105' 
                                                : 'bg-black/40 border-white/20 group-hover:border-secondary/60'
                                        }`}>
                                            {todayProgress[habit.id] && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className={`text-sm font-semibold transition-all duration-200 truncate ${
                                            todayProgress[habit.id] 
                                                ? 'text-gray-500 line-through' 
                                                : 'text-gray-200 group-hover:text-white'
                                        }`}>
                                            {habit.title}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {progressPercentage === 100 && habits.length > 0 && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center shadow-inner mt-4 animate-bounce">
                                <p className="text-primary font-bold text-xs">🎉 Fantastic job! You completed all habits today!</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
