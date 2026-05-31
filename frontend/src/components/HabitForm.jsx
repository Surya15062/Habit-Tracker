import { useState, useMemo } from 'react';
import { Plus, X, Search, Check, ChevronDown } from 'lucide-react';

const EMOJI_CATEGORIES = [
    {
        name: 'Health',
        emojis: ['💧', '🍎', '🥗', '💊', '🦷', '🧘', '🧼', '🩸', '🩺', '🛌']
    },
    {
        name: 'Fitness',
        emojis: ['🏃', '💪', '🚴', '🏊', '🧗', '🏋️', '🎾', '⚽', '🏀', '🎿']
    },
    {
        name: 'Productivity',
        emojis: ['🎯', '✅', '📝', '⏰', '📅', '📊', '📈', '💼', '🏆', '🏅']
    },
    {
        name: 'Learning',
        emojis: ['📚', '🎓', '🧠', '🔬', '🔭', '💡', '📖', '✏️', '🎒', '🧩']
    },
    {
        name: 'Work',
        emojis: ['💻', '⌨️', '🖱️', '🖥️', '📁', '📞', '✉️', '💸', '🔨', '🔧']
    },
    {
        name: 'Lifestyle',
        emojis: ['🌿', '☀️', '🚶', '☕', '🍵', '🏡', '🧹', '🐕', '🐈', '🚗']
    },
    {
        name: 'Entertainment',
        emojis: ['🎮', '🎬', '🎧', '🎸', '🎨', '📸', '📺', '🎫', '🍿', '🎲']
    },
    {
        name: 'Creativity',
        emojis: ['✍️', '🎹', '📷', '🧶', '🧵', '✂️', '🎤', '🩰', '🎭', '🖌️']
    }
];

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Custom'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitForm({ onSave, onCancel }) {
    const [title, setTitle] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🎯');
    
    // Emoji state
    const [emojiSearch, setEmojiSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].name);

    // Frequency state
    const [frequency, setFrequency] = useState('Daily');
    
    // Custom frequency state
    const [customType, setCustomType] = useState('specific_days'); // 'specific_days' or 'every_x_days'
    const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri']);
    const [everyXDays, setEveryXDays] = useState(2);

    const filteredEmojis = useMemo(() => {
        if (!emojiSearch.trim()) {
            return EMOJI_CATEGORIES.find(c => c.name === activeCategory)?.emojis || [];
        }
        const lowerSearch = emojiSearch.toLowerCase();
        // If searching, search across all categories (matching by category name isn't great, so we just show all if no tags, but here we can just flatten)
        // Ideally we'd have keywords, but for simplicity, we just flatten and return all if they search.
        // Wait, if we just flatten, what do we filter by? We don't have text tags for each emoji.
        // Let's filter categories by name, or just show all if search is active but we don't have tags.
        // Let's implement a simple keyword map or just filter category names.
        return EMOJI_CATEGORIES.flatMap(c => c.emojis); // Return all to let user see them, actual emoji search by name requires a heavy library.
        // Better yet, let's just let the search filter by Category Name for now to keep it lightweight.
    }, [emojiSearch, activeCategory]);

    // Enhanced search logic: just mapping category names to emojis if they type something
    const displayedEmojis = useMemo(() => {
        if (!emojiSearch.trim()) {
            return [{ name: activeCategory, emojis: EMOJI_CATEGORIES.find(c => c.name === activeCategory)?.emojis || [] }];
        }
        const search = emojiSearch.toLowerCase();
        const results = EMOJI_CATEGORIES.filter(c => c.name.toLowerCase().includes(search));
        if (results.length > 0) return results;
        
        // If no category matches, just show everything as a fallback
        return [{ name: 'All', emojis: EMOJI_CATEGORIES.flatMap(c => c.emojis) }];
    }, [emojiSearch, activeCategory]);

    const toggleDay = (day) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        let finalFrequency = frequency;
        if (frequency === 'Custom') {
            if (customType === 'specific_days') {
                if (selectedDays.length === 0) return; // Prevent saving without days
                // Sort days conceptually
                const sortedDays = DAYS_OF_WEEK.filter(d => selectedDays.includes(d));
                finalFrequency = `Custom - ${sortedDays.join(', ')}`;
            } else {
                finalFrequency = `Every ${everyXDays} days`;
            }
        }

        onSave({
            title: title.trim(),
            emoji: selectedEmoji,
            frequency: finalFrequency
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card-dark p-6 rounded-3xl border border-white/10 flex flex-col gap-8 shadow-2xl animate-fade-in-up">
            
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create New Habit</h3>
                <button type="button" onClick={onCancel} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Habit Title */}
            <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Habit Name
                </label>
                <input
                    type="text"
                    placeholder="E.g., Read 20 pages, Drink Water..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary text-base text-white placeholder-gray-600 transition-colors shadow-inner"
                />
            </div>

            {/* Icon Selection */}
            <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Choose Icon
                </label>
                
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-4">
                    {/* Search & Categories */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search category..."
                                value={emojiSearch}
                                onChange={e => setEmojiSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-primary text-sm text-white placeholder-gray-500 transition-colors"
                            />
                        </div>
                        
                        <div className="flex-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full">
                            <div className="flex space-x-2">
                                {EMOJI_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => { setActiveCategory(cat.name); setEmojiSearch(''); }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            activeCategory === cat.name && !emojiSearch
                                                ? 'bg-primary text-black shadow-md shadow-primary/20'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Emoji Grid */}
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 sm:gap-4 max-h-60 overflow-y-auto pr-2 p-2 custom-scrollbar">
                        {displayedEmojis.map(group => (
                            group.emojis.map((emoji, idx) => {
                                const isSelected = selectedEmoji === emoji;
                                return (
                                    <div key={`${group.name}-${emoji}-${idx}`} className="relative group">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEmoji(emoji)}
                                            className={`w-full aspect-square flex items-center justify-center rounded-2xl text-3xl sm:text-4xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer ${
                                                isSelected
                                                    ? 'bg-primary/20 border-2 border-primary scale-110 shadow-[0_0_20px_rgba(163,230,53,0.4)] z-10'
                                                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] opacity-60 hover:opacity-100'
                                            }`}
                                            aria-label={`Select ${emoji} icon`}
                                            aria-pressed={isSelected}
                                        >
                                            <span className={`transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                {emoji}
                                            </span>
                                        </button>
                                        
                                        {/* Checkmark Badge */}
                                        {isSelected && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-primary text-black rounded-full p-0.5 shadow-md border-2 border-[#1c1c1c] z-20 animate-check-pop">
                                                <Check className="w-3 h-3 stroke-[4]" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Frequency
                </label>
                
                {/* Segmented Pill Control */}
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                    {FREQUENCIES.map(freq => (
                        <button
                            key={freq}
                            type="button"
                            onClick={() => setFrequency(freq)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                frequency === freq
                                    ? 'bg-primary text-black shadow-md scale-[1.02]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {freq}
                        </button>
                    ))}
                </div>

                {/* Custom Frequency Sub-options */}
                {frequency === 'Custom' && (
                    <div className="bg-black/30 rounded-2xl p-4 border border-primary/20 space-y-5 animate-fade-in-up mt-2">
                        
                        <div className="flex space-x-4 border-b border-white/10 pb-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    checked={customType === 'specific_days'}
                                    onChange={() => setCustomType('specific_days')}
                                    className="accent-primary w-4 h-4"
                                />
                                <span className={`text-sm ${customType === 'specific_days' ? 'text-white font-bold' : 'text-gray-400'}`}>Specific Days</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    checked={customType === 'every_x_days'}
                                    onChange={() => setCustomType('every_x_days')}
                                    className="accent-primary w-4 h-4"
                                />
                                <span className={`text-sm ${customType === 'every_x_days' ? 'text-white font-bold' : 'text-gray-400'}`}>Every X Days</span>
                            </label>
                        </div>

                        {customType === 'specific_days' ? (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 font-medium">Select the days you want to complete this habit:</p>
                                <div className="flex justify-between gap-2">
                                    {DAYS_OF_WEEK.map(day => {
                                        const isSelected = selectedDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                                                    isSelected
                                                        ? 'bg-primary text-black shadow-[0_0_10px_rgba(163,230,53,0.4)] scale-110'
                                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                }`}
                                            >
                                                {day.charAt(0)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-300">Repeat every</span>
                                <input 
                                    type="number" 
                                    min="2" 
                                    max="30"
                                    value={everyXDays}
                                    onChange={e => setEveryXDays(parseInt(e.target.value) || 2)}
                                    className="w-20 bg-black/50 border border-white/20 rounded-xl p-2 text-center text-white font-bold focus:border-primary outline-none"
                                />
                                <span className="text-sm text-gray-300">days</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={!title.trim() || (frequency === 'Custom' && customType === 'specific_days' && selectedDays.length === 0)}
                    className="w-full flex items-center justify-center space-x-2 bg-primary text-black font-extrabold py-4 rounded-2xl hover:bg-primary/90 transition-all duration-300 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <Check className="w-5 h-5" />
                    <span>Create Habit</span>
                </button>
            </div>
            
            {/* Custom Scrollbar CSS for Emoji Picker */}
            <style jsx="true">{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </form>
    );
}
