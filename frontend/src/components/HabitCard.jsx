import PropTypes from 'prop-types';
import { Check, Edit2, Trash2 } from 'lucide-react';

export default function HabitCard({ 
    habit, 
    isCompletedForToday, 
    onToggleProgress, 
    onDelete,
    onEdit,
    streak = 0,
}) {
    return (
        <div className="bg-card-dark rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.99] relative overflow-hidden group flex flex-col justify-between min-h-[160px] animate-fade-in-up">
            {/* Top Indicator bar */}
            <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${isCompletedForToday ? 'bg-primary' : 'bg-white/10'}`} />

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-4">
                    {/* iOS-style toggle */}
                    <button
                        onClick={() => onToggleProgress(habit.id, !isCompletedForToday)}
                        className={`w-9 h-9 rounded-full border-[2px] flex-shrink-0 flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isCompletedForToday 
                                ? 'bg-primary border-primary text-black scale-110 shadow-md shadow-primary/20 animate-check-pop' 
                                : 'bg-transparent border-gray-500 hover:border-gray-400 text-transparent hover:bg-white/5'
                        }`}
                        aria-label={isCompletedForToday ? "Mark as incomplete" : "Mark as complete"}
                    >
                        <Check className="w-5 h-5 stroke-[3]" />
                    </button>

                    {/* Title and Status */}
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
                            <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200" role="img" aria-label={habit.title}>
                                {habit.emoji || '🎯'}
                            </span>
                            <span className="line-clamp-1">{habit.title}</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                            {habit.frequency}
                        </p>
                    </div>
                </div>
                
                {/* Actions (visible on hover) */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(habit)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none"
                            title="Edit Habit"
                            aria-label="Edit Habit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(habit.id)}
                            className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none"
                            title="Delete Habit"
                            aria-label="Delete Habit"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Status Section */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-6 items-center">
                <div className="flex-1">
                    <p className={`text-sm font-semibold transition-colors duration-200 ${isCompletedForToday ? 'text-primary' : 'text-gray-400'}`}>
                        {isCompletedForToday ? '✓ Completed Today' : '○ Due Today'}
                    </p>
                </div>
                
                {/* Streak Information */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        🔥 {streak} {streak === 1 ? 'Day' : 'Days'} Streak
                    </span>
                </div>
            </div>
        </div>
    );
}

HabitCard.propTypes = {
    habit: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string.isRequired,
        emoji: PropTypes.string,
        frequency: PropTypes.string.isRequired,
    }).isRequired,
    isCompletedForToday: PropTypes.bool,
    onToggleProgress: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    streak: PropTypes.number,
};

HabitCard.defaultProps = {
    isCompletedForToday: false,
    onDelete: null,
    onEdit: null,
    streak: 0,
};
