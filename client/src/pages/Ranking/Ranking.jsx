import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Trophy, Flame, Target, BookOpen, Crown } from "lucide-react";

const MEDALS = ["🥇", "🥈", "🥉"];

const computeScore = (user) => {
    return (user.totalQuestionsSolved || 0) * 3 + (user.studyHours || 0) * 5 + (user.currentStreak || 0) * 10;
};

const Ranking = () => {
    const { currentUser, mongoUser } = useAuth();
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/progress/dashboard").then(res => {
            setDashData(res.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    // Simulate leaderboard with current user and simulated peers
    const simulatedUsers = dashData ? [
        {
            name: currentUser?.displayName || "You",
            email: currentUser?.email,
            totalQuestionsSolved: dashData.overview.totalQuestionsSolved,
            studyHours: dashData.overview.studyHours,
            currentStreak: dashData.overview.currentStreak,
            accuracy: dashData.overview.overallAccuracy,
            isYou: true,
        },
        { name: "Arjun Sharma", email: "arjun@x.com", totalQuestionsSolved: 320, studyHours: 85, currentStreak: 18, accuracy: 78, isYou: false },
        { name: "Priya Verma", email: "priya@x.com", totalQuestionsSolved: 280, studyHours: 72, currentStreak: 14, accuracy: 82, isYou: false },
        { name: "Rohan Das", email: "rohan@x.com", totalQuestionsSolved: 150, studyHours: 40, currentStreak: 7, accuracy: 65, isYou: false },
        { name: "Sneha Patil", email: "sneha@x.com", totalQuestionsSolved: 90, studyHours: 25, currentStreak: 3, accuracy: 55, isYou: false },
    ]
        .map(u => ({ ...u, score: computeScore(u) }))
        .sort((a, b) => b.score - a.score)
        .map((u, i) => ({ ...u, rank: i + 1 }))
        : [];

    const youEntry = simulatedUsers.find(u => u.isYou);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="page-title">🏆 Weekly Ranking</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Based on questions solved, study hours, and consistency</p>
            </div>

            {/* Your stats */}
            {youEntry && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="card bg-gradient-to-r from-brand-500/10 to-violet-500/10 border-brand-300/30 dark:border-brand-700/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl font-bold text-brand-500">#{youEntry.rank}</div>
                        <div>
                            <p className="font-bold text-gray-800 dark:text-white">{youEntry.name} (You)</p>
                            <p className="text-sm text-gray-500">Score: {youEntry.score} points</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl py-3">
                            <p className="text-xl font-bold text-brand-500">{youEntry.totalQuestionsSolved}</p>
                            <p className="text-xs text-gray-500">Questions</p>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl py-3">
                            <p className="text-xl font-bold text-orange-500">{youEntry.currentStreak}🔥</p>
                            <p className="text-xs text-gray-500">Streak</p>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl py-3">
                            <p className="text-xl font-bold text-emerald-500">{youEntry.accuracy}%</p>
                            <p className="text-xs text-gray-500">Accuracy</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Scoring System */}
            <div className="card">
                <h2 className="section-title">🧮 Scoring Formula</h2>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <BookOpen size={18} className="mx-auto mb-1 text-brand-500" />
                        <p className="font-bold text-gray-700 dark:text-gray-200">×3</p>
                        <p className="text-gray-500 text-xs">Per Question</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <Target size={18} className="mx-auto mb-1 text-violet-500" />
                        <p className="font-bold text-gray-700 dark:text-gray-200">×5</p>
                        <p className="text-gray-500 text-xs">Per Hour</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <Flame size={18} className="mx-auto mb-1 text-orange-500" />
                        <p className="font-bold text-gray-700 dark:text-gray-200">×10</p>
                        <p className="text-gray-500 text-xs">Per Streak Day</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="card">
                <h2 className="section-title flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Leaderboard</h2>
                <div className="space-y-2">
                    {simulatedUsers.map((user, idx) => (
                        <motion.div key={user.email || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.07 }}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${user.isYou ? "bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700" : "bg-gray-50 dark:bg-gray-700/50"}`}>
                            <div className="w-10 text-center">
                                {user.rank <= 3 ? (
                                    <span className="text-xl">{MEDALS[user.rank - 1]}</span>
                                ) : (
                                    <span className="text-lg font-bold text-gray-500">#{user.rank}</span>
                                )}
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${user.isYou ? "text-brand-600 dark:text-brand-300" : "text-gray-800 dark:text-white"}`}>
                                    {user.name} {user.isYou && <span className="text-xs bg-brand-100 dark:bg-brand-900/50 text-brand-500 px-1.5 py-0.5 rounded-md ml-1">You</span>}
                                </p>
                                <p className="text-xs text-gray-400">{user.totalQuestionsSolved} Q · {user.studyHours.toFixed(0)}h · {user.currentStreak}🔥</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-800 dark:text-white text-sm">{user.score}</p>
                                <p className="text-xs text-gray-400">pts</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-4 italic">* Peers are simulated for demonstration. Multiplayer ranking coming soon!</p>
            </div>
        </div>
    );
};

export default Ranking;
