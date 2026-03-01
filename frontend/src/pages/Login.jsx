import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/auth/login', {
                name: name.trim(),
                age: parseInt(age)
            });
            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
            <div className="w-full max-w-md bg-card-dark p-8 rounded-2xl shadow-xl border border-white/10">
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Welcome</h2>
                <p className="text-gray-400 text-center mb-6 text-sm">Enter your details to log in or create a profile.</p>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-400">Name</label>
                        <input
                            type="text"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition-colors"
                            value={name} onChange={(e) => setName(e.target.value)} required
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-400">Age</label>
                        <input
                            type="number"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition-colors"
                            value={age} onChange={(e) => setAge(e.target.value)} required
                            min="1" max="120" placeholder="e.g. 25"
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-black font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors mt-6">
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
