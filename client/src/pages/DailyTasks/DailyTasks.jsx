import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, ListTodo, Plus, Trash2, CalendarDays } from "lucide-react";

const DailyTasks = () => {
    const { currentUser } = useAuth();
    const [plan, setPlan] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchPlan = useCallback(async () => {
        try {
            const res = await api.get("/api/planner/today");
            setPlan(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlan(); }, [fetchPlan]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !plan) return;
        try {
            const updatedTasks = [...plan.tasks, { title: newTaskTitle, isCompleted: false, category: "Other" }];
            const res = await api.put(`/api/planner/${plan._id}`, { tasks: updatedTasks });
            setPlan(res.data);
            setNewTaskTitle("");
        } catch (err) { console.error(err); }
    };

    const toggleTask = async (index) => {
        if (!plan) return;
        try {
            const updatedTasks = [...plan.tasks];
            updatedTasks[index].isCompleted = !updatedTasks[index].isCompleted;
            const res = await api.put(`/api/planner/${plan._id}`, { tasks: updatedTasks });
            setPlan(res.data);
        } catch (err) { console.error(err); }
    };

    const removeTask = async (index) => {
        if (!plan) return;
        try {
            const updatedTasks = plan.tasks.filter((_, i) => i !== index);
            const res = await api.put(`/api/planner/${plan._id}`, { tasks: updatedTasks });
            setPlan(res.data);
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const completedCount = plan?.tasks.filter(t => t.isCompleted).length || 0;
    const totalCount = plan?.tasks.length || 0;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <ListTodo className="text-brand-500" size={32} /> Daily Planner
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                        <CalendarDays size={16} /> {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Today's Goals</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Check off tasks as you complete them.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-brand-500">{completedCount} / {totalCount}</div>
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completed</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-8">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-brand-500 to-indigo-400"
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-3 mb-8">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="What do you need to study today? (e.g. Solve 5 array problems, Revise Trees...)"
                        className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-brand-500 transition-colors"
                        autoFocus
                    />
                    <button type="submit" disabled={!newTaskTitle.trim()} className="btn-primary flex items-center gap-2 px-6">
                        <Plus size={20} /> Add
                    </button>
                </form>

                {/* Task List */}
                <div className="space-y-3">
                    {plan?.tasks.length === 0 ? (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ListTodo size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-gray-800 dark:text-white font-semibold mb-1">No tasks for today</h3>
                            <p className="text-gray-500 text-sm">Add some study goals above to get started!</p>
                        </div>
                    ) : (
                        plan?.tasks.map((task, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={i}
                                className={`flex items-center justify-between p-4 rounded-xl border ${task.isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'} hover:border-gray-300 dark:hover:border-gray-600 transition-all group`}
                            >
                                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(i)}>
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {task.isCompleted && <CheckCircle2 size={16} className="text-white" />}
                                    </div>
                                    <span className={`text-base font-medium transition-colors ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {task.title}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeTask(i)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyTasks;
