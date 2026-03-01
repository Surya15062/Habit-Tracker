import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import HabitCard from '../components/HabitCard';
import { Plus, CheckSquare, Square } from 'lucide-react';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [habits, setHabits] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);

    // New habit form
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newFrequency, setNewFrequency] = useState('daily');

    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const today = getTodayString();

    const fetchData = async () => {
        try {
            const [habitsRes, progressRes] = await Promise.all([
                axios.get('/habits'),
                axios.get(`/progress/today?date=${today}`)
            ]);

            setHabits(habitsRes.data);

            const progressMap = {};
            progressRes.data.forEach(p => {
                progressMap[p.habit_id] = p.completed === 1 || p.completed === true;
            });
            setProgress(progressMap);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [today]);

    const toggleProgress = async (habitId, completed) => {
        try {
            // Optimistic update
            setProgress(prev => ({ ...prev, [habitId]: completed }));
            await axios.post('/progress', {
                habit_id: habitId,
                date: today,
                completed
            });
            // We could re-fetch stats here if we show them
        } catch (err) {
            console.error('Failed to update progress', err);
            // Revert optimistic update
            fetchData();
        }
    };

    const addHabit = async (e) => {
        e.preventDefault();
        if (!newTitle) return;
        try {
            await axios.post('/habits', { title: newTitle, frequency: newFrequency });
            setNewTitle('');
            setShowAdd(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteHabit = async (habitId) => {
        if (!confirm('Delete this habit?')) return;
        try {
            await axios.delete(`/habits/${habitId}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Loading dashboard...</div>;

    const completedCount = Object.values(progress).filter(Boolean).length;
    const progressPercentage = habits.length ? Math.round((completedCount / habits.length) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Greeting Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Hello, {user?.name}! 👋</h1>
                    <p className="text-gray-400">Here's your habit tracking overview for today.</p>
                </div>
                <div className="mt-6 md:mt-0 flex items-center space-x-6 bg-card-dark p-4 rounded-2xl border border-white/5">
                    <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Today's Progress</p>
                        <p className="text-2xl font-bold text-primary">{completedCount} <span className="text-lg text-gray-500 font-normal">/ {habits.length}</span></p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-black/40 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(178,240,66,0.1)]">
                        {/* Simple circular visualizer simulation using borders */}
                        <div className="absolute inset-0 rounded-full border-4 border-primary" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progressPercentage}%, 0 ${progressPercentage}%)` }}></div>
                        <span className="font-bold relative z-10">{progressPercentage}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Habits List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Your Habits</h2>
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className="flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary hover:text-black transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Habit</span>
                        </button>
                    </div>

                    {showAdd && (
                        <form onSubmit={addHabit} className="bg-card-dark p-6 rounded-2xl border border-white/10 mb-6 flex space-x-4">
                            <input
                                type="text"
                                placeholder="E.g., Read 20 pages"
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary"
                                value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                required autoFocus
                            />
                            <select
                                className="bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary px-4"
                                value={newFrequency} onChange={e => setNewFrequency(e.target.value)}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="custom">Custom</option>
                            </select>
                            <button type="submit" className="bg-primary text-black font-semibold px-6 rounded-lg hover:bg-primary/90">
                                Save
                            </button>
                        </form>
                    )}

                    {habits.length === 0 ? (
                        <div className="bg-card-dark rounded-2xl p-12 text-center border border-white/5 border-dashed">
                            <p className="text-gray-400 mb-4">You haven't added any habits yet.</p>
                            <button onClick={() => setShowAdd(true)} className="bg-primary text-black font-semibold px-6 py-2 rounded-lg inline-flex items-center space-x-2">
                                <Plus className="w-4 h-4" /> <span>Create first habit</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {habits.map(habit => (
                                <div key={habit.id} className="relative">
                                    <HabitCard
                                        habit={habit}
                                        isCompletedForToday={progress[habit.id]}
                                        onToggleProgress={toggleProgress}
                                    />
                                    <button
                                        onClick={() => deleteHabit(habit.id)}
                                        className="absolute bottom-6 right-6 text-sm text-red-500/50 hover:text-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Checklist */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Today's Checklist</h2>
                    <div className="bg-card-dark p-6 rounded-2xl border border-white/5 shadow-xl">
                        {habits.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center italic py-4">No tasks for today.</p>
                        ) : (
                            <div className="space-y-4">
                                {habits.map(habit => (
                                    <label key={habit.id} className="flex items-center space-x-4 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={!!progress[habit.id]}
                                                onChange={(e) => toggleProgress(habit.id, e.target.checked)}
                                            />
                                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${progress[habit.id] ? 'bg-secondary border-secondary' : 'bg-black/30 border-white/20 group-hover:border-secondary/50'}`}>
                                                {progress[habit.id] && <CheckSquare className="w-4 h-4 text-white" />}
                                            </div>
                                        </div>
                                        <span className={`transition-all duration-200 ${progress[habit.id] ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                            {habit.title}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {progressPercentage === 100 && habits.length > 0 && (
                            <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
                                <p className="text-primary font-semibold text-sm">🎉 You crushed it today!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
