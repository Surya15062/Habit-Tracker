import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import HabitCard from '../components/HabitCard';
import { Plus, CheckSquare, Sparkles, ClipboardList } from 'lucide-react';

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

const EMOJI_PRESETS = [
    { char: '📚', label: 'Reading' },
    { char: '💧', label: 'Water' },
    { char: '🏃', label: 'Running' },
    { char: '🧘', label: 'Meditation' },
    { char: '💪', label: 'Workout' },
    { char: '😴', label: 'Sleep' },
    { char: '🍎', label: 'Healthy Food' },
    { char: '🎯', label: 'Goals' },
    { char: '💻', label: 'Coding' },
    { char: '🎨', label: 'Design' }
];
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const today = useMemo(() => getTodayStr(), []);

    const [habits, setHabits] = useState(loadHabits);
    const [progress, setProgress] = useState(loadProgress);

    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newFrequency, setNewFrequency] = useState('daily');
    const [selectedEmoji, setSelectedEmoji] = useState('🎯');

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
            emoji: selectedEmoji,
            frequency: newFrequency.charAt(0).toUpperCase() + newFrequency.slice(1),
            created_at: new Date().toISOString(),
        };
        setHabits(prev => [...prev, newHabit]);
        setNewTitle('');
        setNewFrequency('daily');
        setSelectedEmoji('🎯');
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
        <div className="space-y-8 animate-fade-in-up">
            {/* Top Banner Row: Greeting + Progress Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Greeting Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-card-dark to-card-dark/60 border border-white/5 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg hover:border-white/10 transition-colors duration-300">
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
                <div className="bg-card-dark border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden hover:border-white/10 transition-colors duration-300">
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
                            className="flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] glow-primary-hover"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Habit</span>
                        </button>
                    </div>

                    {/* Add Habit Form Panel */}
                    {showAdd && (
                        <form 
                            onSubmit={addHabit} 
                            className="bg-card-dark p-6 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-inner"
                        >
                            <div className="flex flex-col md:flex-row gap-4 items-stretch">
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
                            </div>

                            {/* iOS Style Emoji Presets Selector */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Choose Habit Icon
                                </label>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 bg-black/30 p-2 rounded-xl border border-white/5">
                                    {EMOJI_PRESETS.map((preset) => (
                                        <button
                                            key={preset.char}
                                            type="button"
                                            onClick={() => setSelectedEmoji(preset.char)}
                                            className={`p-2.5 rounded-lg text-xl text-center transition-all duration-200 hover:bg-white/10 active:scale-90 cursor-pointer ${
                                                selectedEmoji === preset.char 
                                                    ? 'bg-primary/20 border border-primary/40 scale-110 shadow-sm' 
                                                    : 'border border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                            title={preset.label}
                                        >
                                            {preset.char}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="bg-primary text-black font-extrabold py-3.5 rounded-xl hover:bg-primary/95 transition-all duration-300 text-sm cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transform hover:scale-[1.01] active:scale-[0.99] glow-primary-hover"
                            >
                                Save Habit
                            </button>
                        </form>
                    )}

                    {/* Habits Cards Grid */}
                    {habits.length === 0 ? (
                        <div className="bg-card-dark rounded-3xl p-16 text-center border border-white/5 border-dashed flex flex-col items-center justify-center space-y-6 animate-fade-in-up">
                            {/* Graphic Clipboard Empty State */}
                            <div className="relative w-24 h-24 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-inner">
                                <ClipboardList className="w-10 h-10 text-gray-400" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-md">
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-2 max-w-sm">
                                <h3 className="text-xl font-bold text-white tracking-tight">Your habit journal is empty</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Track, visualize, and improve your daily routines. Create your first habit using the preset icons to build your streaks.
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowAdd(true)} 
                                className="bg-primary text-black font-bold px-6 py-3 rounded-xl inline-flex items-center space-x-2 text-sm hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 glow-primary-hover"
                            >
                                <Plus className="w-4 h-4" /> 
                                <span>Create first habit</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {habits.map((habit, index) => (
                                <div 
                                    key={habit.id} 
                                    className={`animate-fade-in-up delay-${(index % 5) * 50}`}
                                >
                                    <HabitCard
                                        habit={habit}
                                        isCompletedForToday={todayProgress[habit.id]}
                                        onToggleProgress={toggleProgress}
                                        onDelete={deleteHabit}
                                    />
                                </div>
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
                                {habits.map((habit, index) => (
                                    <label 
                                        key={habit.id} 
                                        className={`flex items-center space-x-4 cursor-pointer group p-3 hover:bg-white/5 rounded-xl transition-all duration-200 animate-fade-in-up delay-${(index % 5) * 50}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!todayProgress[habit.id]}
                                            onChange={(e) => toggleProgress(habit.id, e.target.checked)}
                                            className="hidden"
                                        />
                                        <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-200 checkbox-transition ${
                                            todayProgress[habit.id] 
                                                ? 'bg-secondary border-secondary shadow-md shadow-secondary/15 scale-105 animate-check-pop' 
                                                : 'bg-black/40 border-white/20 group-hover:border-secondary/60'
                                        }`}>
                                            {todayProgress[habit.id] && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className="text-base mr-1.5 flex-shrink-0">
                                            {habit.emoji || '🎯'}
                                        </span>
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
