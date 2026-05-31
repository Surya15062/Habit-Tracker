import PropTypes from 'prop-types';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';

export default function HabitCard({ habit, isCompletedForToday, onToggleProgress, onDelete }) {
    return (
        <div className="bg-card-dark rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden group flex flex-col justify-between min-h-[160px]">
            {/* Top Indicator bar */}
            <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${isCompletedForToday ? 'bg-primary' : 'bg-white/10'}`} />

            <div className="flex justify-between items-start mb-4">
                <div className="pr-4">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors duration-200">{habit.title}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{habit.frequency}</p>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Toggle buttons for progress */}
                    <div className="flex bg-black/40 rounded-lg overflow-hidden border border-white/10">
                        <button
                            onClick={() => onToggleProgress(habit.id, false)}
                            className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                            title="Mark incomplete"
                            aria-label="Mark habit incomplete"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px bg-white/10" />
                        <button
                            onClick={() => onToggleProgress(habit.id, true)}
                            className="p-2 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                            title="Mark complete"
                            aria-label="Mark habit complete"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Delete Button (visible on hover/active) */}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(habit.id)}
                            className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none"
                            title="Delete Habit"
                            aria-label="Delete Habit"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Visual Indicator of Today's Status */}
            <div className="flex items-center space-x-3 mt-auto pt-4 border-t border-white/5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isCompletedForToday ? 'bg-primary text-black scale-110 shadow-md shadow-primary/20' : 'bg-black/50 border border-white/10 text-transparent'}`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className={`text-xs font-semibold transition-colors duration-200 ${isCompletedForToday ? 'text-primary' : 'text-gray-400'}`}>
                    {isCompletedForToday ? 'Completed today! Outstanding!' : 'Not completed today yet'}
                </span>
            </div>
        </div>
    );
}

HabitCard.propTypes = {
    habit: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        frequency: PropTypes.string.isRequired,
    }).isRequired,
    isCompletedForToday: PropTypes.bool,
    onToggleProgress: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
};

HabitCard.defaultProps = {
    isCompletedForToday: false,
    onDelete: null,
};
