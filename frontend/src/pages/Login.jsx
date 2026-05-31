import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
    const [name, setName] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        login({ name: name.trim() });
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-4 font-sans antialiased overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md bg-card-dark/85 backdrop-blur-md p-10 rounded-3xl border border-white/5 shadow-2xl relative z-10 transition-all duration-300 hover:border-white/10 animate-fade-in-up">
                
                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5 transform hover:rotate-12 transition-transform duration-300">
                        <Activity className="w-8 h-8 text-primary" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-center tracking-tight text-white mb-2">
                    Welcome Tracker
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm leading-relaxed">
                    Set a username to personalize your habit building space.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                            Your Name <span className="text-primary">*</span>
                        </label>
                        <input
                            id="login-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your name"
                            autoFocus
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-base placeholder-gray-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                        />
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/95 text-black font-extrabold py-3.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 cursor-pointer focus:outline-none"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
