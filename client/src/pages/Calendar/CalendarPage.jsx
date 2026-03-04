import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { ChevronLeft, ChevronRight, Plus, X, Flame } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CalendarPage = () => {
    const [logs, setLogs] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ hoursStudied: "", topicsCovered: "", notes: "" });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await api.get("/api/calendar");
            const logMap = {};
            res.data.forEach(log => { logMap[log.date] = log; });
            setLogs(logMap);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split("T")[0];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const formatDate = (day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const openDay = (day) => {
        const date = formatDate(day);
        setSelectedDate(date);
        const existing = logs[date];
        setForm({
            hoursStudied: existing?.hoursStudied ?? "",
            topicsCovered: existing?.topicsCovered?.join(", ") ?? "",
            notes: existing?.notes ?? "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.hoursStudied || Number(form.hoursStudied) <= 0) return alert("Please enter valid study hours.");
        setSaving(true);
        try {
            const res = await api.post("/api/calendar", {
                date: selectedDate,
                hoursStudied: Number(form.hoursStudied),
                topicsCovered: form.topicsCovered.split(",").map(s => s.trim()).filter(Boolean),
                notes: form.notes,
            });
            setLogs(prev => ({ ...prev, [selectedDate]: res.data }));
            setShowModal(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const totalStudied = Object.values(logs).filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === month && d.getFullYear() === year;
    }).length;

    const streakCount = Object.values(logs).length;

    const getIntensity = (hours) => {
        if (!hours) return "";
        if (hours < 2) return "bg-green-200 dark:bg-green-900/40";
        if (hours < 4) return "bg-green-400 dark:bg-green-600";
        return "bg-green-600 dark:bg-green-400";
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="page-title">📅 Study Calendar</h1>
                <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-xl">
                    <Flame size={18} className="text-orange-500" />
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{streakCount} days logged</span>
                </div>
            </div>

            {/* Month summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Days Studied", value: totalStudied, color: "text-brand-500" },
                    { label: "This Month", value: `${MONTHS[month].slice(0, 3)} ${year}`, color: "text-violet-500" },
                    { label: "Total Hours", value: `${Object.values(logs).reduce((s, l) => s + (l.hoursStudied || 0), 0).toFixed(1)}h`, color: "text-emerald-500" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="card text-center">
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Calendar */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{MONTHS[month]} {year}</h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const date = formatDate(day);
                        const log = logs[date];
                        const isToday = date === today;
                        return (
                            <motion.button key={day} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                onClick={() => openDay(day)}
                                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                  ${isToday ? "ring-2 ring-brand-500" : ""}
                  ${log ? `${getIntensity(log.hoursStudied)} text-gray-800 dark:text-white` : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                                <span>{day}</span>
                                {log && <span className="text-xs opacity-70">{log.hoursStudied}h</span>}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400">Hours:</span>
                    {[["<2h", "bg-green-200 dark:bg-green-900/40"], ["2-4h", "bg-green-400 dark:bg-green-600"], [">4h", "bg-green-600 dark:bg-green-400"]].map(([label, cls]) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-sm ${cls}`} />
                            <span className="text-xs text-gray-400">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Log Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                Log Study — {new Date(selectedDate + "T00:00:00").toDateString()}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Hours Studied *</label>
                                <input type="number" min="0" max="24" step="0.5" placeholder="e.g. 3" value={form.hoursStudied} onChange={e => setForm({ ...form, hoursStudied: e.target.value })} className="input" />
                            </div>
                            <div>
                                <label className="label">Topics Covered (comma-separated)</label>
                                <input type="text" placeholder="Arrays, Recursion, numerical ability" value={form.topicsCovered} onChange={e => setForm({ ...form, topicsCovered: e.target.value })} className="input" />
                            </div>
                            <div>
                                <label className="label">Notes (optional)</label>
                                <textarea rows={3} placeholder="What did you learn today?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input resize-none" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                                    {saving ? "Saving..." : "Save Log"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
