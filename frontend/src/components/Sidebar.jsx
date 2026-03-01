import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, BarChart3, LogOut, CheckCircle2 } from 'lucide-react';

export default function Sidebar() {
    const { logout } = useContext(AuthContext);

    const navItem = "flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5";
    const activeNavItem = "flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 text-black bg-primary font-medium hover:bg-primary/90";

    return (
        <div className="w-64 bg-card-dark border-r border-white/5 h-screen flex flex-col p-6 hidden md:flex">
            <div className="flex items-center space-x-3 mb-12 px-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <CheckCircle2 className="text-black w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">HabitTracker</span>
            </div>

            <nav className="flex-1 space-y-2">
                <NavLink to="/" className={({ isActive }) => isActive ? activeNavItem : navItem}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/stats" className={({ isActive }) => isActive ? activeNavItem : navItem}>
                    <BarChart3 className="w-5 h-5" />
                    <span>Statistics</span>
                </NavLink>
            </nav>

            <button onClick={logout} className="flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-400/10 mt-auto">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </div>
    );
}
