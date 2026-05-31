import PropTypes from 'prop-types';
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, BarChart3, LogOut, CheckCircle2, X } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login', { replace: true });
    };

    const linkClasses = ({ isActive }) =>
        `flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] ${
            isActive
                ? 'text-black bg-primary font-bold shadow-lg shadow-primary/15 scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`;

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Drawer */}
            <div
                className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-64 bg-card-dark border-r border-white/5 flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                {/* Logo & Close Button */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                            <CheckCircle2 className="text-black w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">HabitTracker</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-gray-400 hover:text-white md:hidden focus:outline-none transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2">
                    <NavLink
                        to="/"
                        end
                        onClick={() => setIsOpen(false)}
                        className={linkClasses}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/stats"
                        onClick={() => setIsOpen(false)}
                        className={linkClasses}
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span>Statistics</span>
                    </NavLink>
                </nav>

                {/* Logout Button */}
                <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-auto border border-transparent focus:outline-none cursor-pointer transform active:scale-[0.98]"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );
}

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};
