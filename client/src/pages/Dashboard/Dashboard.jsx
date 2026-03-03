import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale, BarElement, Title, PointElement, LineElement,
} from "chart.js";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
    BookOpen, CheckCircle2, Clock, Flame, Target,
    TrendingUp, AlertTriangle, Download,
} from "lucide-react";
import { jsPDF } from "jspdf";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

const QUOTES = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
];

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="stat-card"
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
);

const Dashboard = () => {
    const { currentUser, mongoUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const quote = QUOTES[new Date().getDay() % QUOTES.length];

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await api.get("/api/progress/dashboard");
            setData(res.data);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("PrepTrack - Progress Report", 20, 20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Name: ${currentUser?.displayName || "User"}`, 20, 35);
        doc.text(`Email: ${currentUser?.email}`, 20, 44);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 53);
        doc.line(20, 60, 190, 60);

        if (data) {
            const { overview, topicsBreakdown } = data;
            doc.setFont("helvetica", "bold");
            doc.text("Overview", 20, 72);
            doc.setFont("helvetica", "normal");
            const stats = [
                `Topics Tracked: ${overview.totalTopicsTracked}`,
                `Topics Completed: ${overview.totalTopicsCompleted}`,
                `Questions Solved: ${overview.totalQuestionsSolved}`,
                `Study Hours: ${overview.studyHours.toFixed(1)}`,
                `Current Streak: ${overview.currentStreak} days`,
                `Overall Accuracy: ${overview.overallAccuracy}%`,
            ];
            stats.forEach((s, i) => doc.text(s, 20, 82 + i * 9));

            doc.setFont("helvetica", "bold");
            doc.text("Weak Topics (Need Attention)", 20, 152);
            doc.setFont("helvetica", "normal");
            if (topicsBreakdown.weakTopics.length === 0) {
                doc.text("No weak topics! Great work!", 20, 162);
            } else {
                topicsBreakdown.weakTopics.forEach((t, i) =>
                    doc.text(`• ${t.name} (${t.subject}) - Accuracy: ${t.accuracy}%`, 20, 162 + i * 9)
                );
            }
        }
        doc.save("PrepTrack_Report.pdf");
    };

    const pieData = data ? {
        labels: ["Strong (>75%)", "Moderate (50-75%)", "Weak (<50%)"],
        datasets: [{
            data: [data.chartsInfo.strongWeakCounts.strong, data.chartsInfo.strongWeakCounts.moderate, data.chartsInfo.strongWeakCounts.weak],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 0,
        }],
    } : null;

    const barData = data ? {
        labels: Object.keys(data.chartsInfo.subjectsData),
        datasets: [{
            label: "Questions Solved",
            data: Object.values(data.chartsInfo.subjectsData),
            backgroundColor: ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"],
            borderRadius: 8,
        }],
    } : null;

    const chartOptions = {
        responsive: true,
        plugins: { legend: { labels: { color: "#9ca3af", font: { size: 12 } } } },
        scales: { x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } }, y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } } },
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const ov = data?.overview || {};

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {currentUser?.displayName?.split(" ")[0] || "Champ"} 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 italic">"{quote}"</p>
                </div>
                <button onClick={exportPDF} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
                    <Download size={16} />
                    Export PDF
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Topics Tracked" value={ov.totalTopicsTracked ?? 0} color="bg-brand-500" delay={0.1} />
                <StatCard icon={CheckCircle2} label="Questions Solved" value={ov.totalQuestionsSolved ?? 0} color="bg-emerald-500" delay={0.15} />
                <StatCard icon={Clock} label="Study Hours" value={`${(ov.studyHours ?? 0).toFixed(1)}h`} color="bg-violet-500" delay={0.2} />
                <StatCard icon={Flame} label="Day Streak" value={`${ov.currentStreak ?? 0} 🔥`} color="bg-orange-500" delay={0.25} />
                <StatCard icon={Target} label="Accuracy" value={`${ov.overallAccuracy ?? 0}%`} color="bg-pink-500" delay={0.3} />
                <StatCard icon={CheckCircle2} label="Completed" value={ov.totalTopicsCompleted ?? 0} color="bg-teal-500" delay={0.35} />
                <StatCard icon={TrendingUp} label="Strong Topics" value={data?.chartsInfo.strongWeakCounts.strong ?? 0} color="bg-green-500" delay={0.4} />
                <StatCard icon={AlertTriangle} label="Weak Topics" value={data?.chartsInfo.strongWeakCounts.weak ?? 0} color="bg-red-500" delay={0.45} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="card">
                    <h2 className="section-title">Topic Strength Distribution</h2>
                    {pieData && pieData.datasets[0].data.some(v => v > 0) ? (
                        <div className="flex justify-center">
                            <div className="w-64 h-64">
                                <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { color: "#9ca3af" } } } }} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Add topics to see chart</div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }} className="card">
                    <h2 className="section-title">Questions per Subject</h2>
                    {barData && barData.datasets[0].data.length > 0 ? (
                        <Bar data={barData} options={chartOptions} />
                    ) : (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Add topics to see chart</div>
                    )}
                </motion.div>
            </div>

            {/* Weak Topics Alert */}
            {data?.topicsBreakdown.weakTopics.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} className="text-red-500" />
                        <h2 className="section-title mb-0">Weak Topics — Needs Attention</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.topicsBreakdown.weakTopics.map(t => (
                            <div key={t.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">{t.name}</span>
                                <span className="text-xs text-red-500 ml-1">({t.subject})</span>
                                <span className="badge-weak ml-2">{t.accuracy}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
