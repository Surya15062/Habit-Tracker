import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        // Store user locally — no backend, no password, no JWT
        login({ name: name.trim(), age: age ? parseInt(age) : null });
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#101010', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: '#1c1c1c', padding: '2.5rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '56px', height: '56px', background: 'rgba(178,240,66,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={28} color="#b2f042" />
                    </div>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', textAlign: 'center', marginBottom: '0.5rem', color: '#fff' }}>
                    Welcome Back
                </h1>
                <p style={{ color: '#888', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Enter your name to start tracking your habits.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#aaa', marginBottom: '0.4rem' }}>
                            Your Name <span style={{ color: '#b2f042' }}>*</span>
                        </label>
                        <input
                            id="login-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. John Doe"
                            autoFocus
                            style={{
                                width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.6rem', padding: '0.85rem 1rem', color: '#fff', fontSize: '1rem',
                                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#b2f042'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#aaa', marginBottom: '0.4rem' }}>
                            Age <span style={{ color: '#666', fontWeight: '400' }}>(optional)</span>
                        </label>
                        <input
                            id="login-age"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="e.g. 25"
                            min="1"
                            max="120"
                            style={{
                                width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.6rem', padding: '0.85rem 1rem', color: '#fff', fontSize: '1rem',
                                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#b2f042'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        style={{
                            width: '100%', background: '#b2f042', color: '#000', fontWeight: '700',
                            fontSize: '1rem', padding: '0.9rem', borderRadius: '0.6rem', border: 'none',
                            cursor: 'pointer', marginTop: '0.5rem', transition: 'opacity 0.2s'
                        }}
                        onMouseOver={e => e.target.style.opacity = '0.85'}
                        onMouseOut={e => e.target.style.opacity = '1'}
                    >
                        Continue →
                    </button>
                </form>
            </div>
        </div>
    );
}
