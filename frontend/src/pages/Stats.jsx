import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Calendar, Target, Award } from 'lucide-react';

export default function Stats() {
    const date = new Date();
    const [year, setYear] = useState(date.getFullYear());
    const [month, setMonth] = useState(date.getMonth() + 1);

    const [monthlyStats, setMonthlyStats] = useState(null);
    const [yearlyStats, setYearlyStats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Month names for labels
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [monthlyRes, yearlyRes] = await Promise.all([
                    axios.get(`/stats/monthly?year=${year}&month=${month}`),
                    axios.get(`/stats/yearly?year=${year}`)
                ]);
                setMonthlyStats(monthlyRes.data);
                setYearlyStats(yearlyRes.data.map(item => ({
                    ...item,
                    name: monthNames[parseInt(item.month.split('-')[1]) - 1]
                })));
            } catch (err) {
                console.error("Error fetching stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [year, month]);

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Loading statistics...</div>;

    const currentMonthCompletion = monthlyStats?.percentage || 0;

    // Calculate overall yearly completion from aggregated data
    const totalYearCompleted = yearlyStats.reduce((sum, item) => sum + item.total_completed, 0);
    const totalYearPossible = yearlyStats.reduce((sum, item) => sum + item.total_possible, 0);
    const yearlyCompletion = totalYearPossible ? Math.round((totalYearCompleted / totalYearPossible) * 100) : 0;

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card-dark border border-white/10 p-3 rounded-lg shadow-xl">
                    <p className="font-bold mb-1">{label}</p>
                    <p className="text-sm">
                        <span className="text-secondary font-semibold">{payload[0].value}%</span> Completed
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {payload[0].payload.total_completed} / {payload[0].payload.total_possible} days
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Statistics & Progress</h1>
                    <p className="text-gray-400">Track your long-term success and consistency.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-4">
                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="bg-card-dark border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-secondary transition-colors"
                    >
                        {monthNames.map((m, idx) => (
                            <option key={m} value={idx + 1}>{m}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-24 bg-card-dark border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-secondary transition-colors"
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-card-dark to-black p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-primary/20 text-primary rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-medium">Monthly Success</h3>
                    </div>
                    <p className="text-4xl font-bold">{currentMonthCompletion}%</p>
                    <p className="text-sm text-gray-500 mt-2">{monthlyStats?.completed_days} days completed</p>
                </div>

                <div className="bg-gradient-to-br from-card-dark to-black p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-secondary/20 text-secondary rounded-xl">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-medium">Yearly Success</h3>
                    </div>
                    <p className="text-4xl font-bold">{yearlyCompletion}%</p>
                    <p className="text-sm text-gray-500 mt-2">Aggregated over {year}</p>
                </div>

                <div className="bg-gradient-to-br from-card-dark to-black p-6 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(178,240,66,0.05)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                        <Award className="w-10 h-10 text-primary mb-2" />
                        <h3 className="font-medium mb-1">Keep It Up!</h3>
                        <p className="text-sm text-gray-400">Consistency is key to forming lasting habits.</p>
                    </div>
                </div>
            </div>

            {/* Yearly Chart */}
            <div className="bg-card-dark p-6 rounded-2xl border border-white/5 shadow-xl">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="w-2 h-6 bg-secondary rounded-full mr-3"></span>
                    {year} Overview
                </h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yearlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar
                                dataKey="percentage"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1500}
                            >
                                {
                                    yearlyStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percentage > 70 ? '#b2f042' : '#b286fd'} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
