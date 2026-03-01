import { Check, Minus, Plus } from 'lucide-react';

export default function HabitCard({ habit, isCompletedForToday, onToggleProgress }) {
    const percentage = 0; // We will pass this if we fetch individual stats, or calculate on frontend. For now, static or random for visual.

    return (
        <div className="bg-card-dark rounded-2xl p-6 border border-white/5 card-hover relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold mb-1">{habit.title}</h3>
                    <p className="text-sm text-gray-400 capitalize">{habit.frequency} Habit</p>
                </div>

                {/* Toggle buttons for progress */}
                <div className="flex bg-black/40 rounded-lg overflow-hidden border border-white/10">
                    <button
                        onClick={() => onToggleProgress(habit.id, false)}
                        className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Mark incomplete"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-white/10" />
                    <button
                        onClick={() => onToggleProgress(habit.id, true)}
                        className="p-2 hover:bg-primary/20 text-primary transition-colors"
                        title="Mark complete"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Visual Indicator of Today's Status */}
            <div className="flex items-center space-x-3 mt-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompletedForToday ? 'bg-primary text-black' : 'bg-black/50 border border-white/20 text-transparent'}`}>
                    <Check className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-300">
                    {isCompletedForToday ? "Completed today! Awesome!" : "Not completed today yet"}
                </span>
            </div>
        </div>
    );
}
