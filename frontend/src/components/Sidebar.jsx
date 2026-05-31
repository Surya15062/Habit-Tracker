import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, BarChart3, LogOut, CheckCircle2 } from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // clears all localStorage
        navigate('/login', { replace: true });
    };

    const navBase = {
        display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
        padding: '0.7rem 0.9rem', borderRadius: '0.75rem', transition: 'all 0.2s',
        textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500',
    };

    return (
        <div style={{ width: '240px', background: '#161616', borderRight: '1px solid rgba(255,255,255,0.05)', height: '100vh', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', position: 'sticky', top: 0, flexShrink: 0 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.4rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #b2f042, #b286fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={18} color="#000" />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>HabitTracker</span>
            </div>

            {/* User info */}
            {user && (
                <div style={{ padding: '0.75rem', background: 'rgba(178,240,66,0.05)', border: '1px solid rgba(178,240,66,0.1)', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.15rem' }}>Logged in as</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#b2f042' }}>{user.name}</p>
                    {user.age && <p style={{ fontSize: '0.75rem', color: '#555' }}>Age: {user.age}</p>}
                </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <NavLink
                    to="/"
                    end
                    style={({ isActive }) => ({
                        ...navBase,
                        background: isActive ? '#b2f042' : 'transparent',
                        color: isActive ? '#000' : '#888',
                    })}
                    onMouseOver={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseOut={e => { if (!e.currentTarget.style.background.includes('rgb(178')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; } }}
                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/stats"
                    style={({ isActive }) => ({
                        ...navBase,
                        background: isActive ? '#b2f042' : 'transparent',
                        color: isActive ? '#000' : '#888',
                    })}
                    onMouseOver={e => { if (!e.currentTarget.style.background.includes('rgb(178')) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseOut={e => { if (!e.currentTarget.style.background.includes('rgb(178')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; } }}
                >
                    <BarChart3 size={18} />
                    <span>Statistics</span>
                </NavLink>
            </nav>

            {/* Logout */}
            <button
                id="logout-btn"
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.75rem', background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s', marginTop: '0.5rem' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgb(239,68,68)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; }}
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </div>
    );
}
