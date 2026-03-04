import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    Trophy,
    LogOut,
    Menu,
    GraduationCap,
    Search,
    Brain, Calculator, Lightbulb, BookText, Database, ListTodo
} from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";

const mainNav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/daily-tasks", label: "Daily Tasks", icon: ListTodo },
];

const subjectNav = [
    { to: "/topics", label: "All Subjects", match: "", icon: BookOpen, color: "text-blue-500" },
    { to: "/topics?subject=DSA", label: "DSA", match: "?subject=DSA", icon: Database, color: "text-indigo-500" },
    { to: "/topics?subject=numerical ability", label: "numerical ability", match: "?subject=numerical ability", icon: Calculator, color: "text-emerald-500" },
    { to: "/topics?subject=Logical Reasoning", match: "?subject=Logical Reasoning", label: "Logical Reasoning", icon: Brain, color: "text-violet-500" },
    { to: "/topics?subject=Verbal", label: "Verbal", match: "?subject=Verbal", icon: BookText, color: "text-pink-500" },
    { to: "/topics?subject=Core", label: "Core Subjects", match: "?subject=Core", icon: Lightbulb, color: "text-orange-500" },
];

const otherNav = [
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/ranking", label: "Ranking", icon: Trophy },
];

const Layout = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await api.get('/api/topics');
            const filtered = res.data.filter(t =>
                t.topicName.toLowerCase().includes(query.toLowerCase()) ||
                t.subjectName.toLowerCase().includes(query.toLowerCase()) ||
                (t.notesHTML && t.notesHTML.toLowerCase().includes(query.toLowerCase()))
            );
            setSearchResults(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <GraduationCap size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-white">PrepTrack</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
                <div className="space-y-1">
                    {mainNav.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to && !location.search;
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                                    }`}
                            >
                                <Icon size={18} />
                                {label}
                            </NavLink>
                        );
                    })}
                </div>

                <div>
                    <h4 className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Subjects</h4>
                    <div className="space-y-1">
                        {subjectNav.map(({ to, label, icon: Icon, match, color }) => {
                            const isActive = location.pathname === "/topics" && location.search === match;
                            return (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-gray-100 dark:bg-gray-700/80 text-gray-800 dark:text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40 hover:text-gray-800 dark:hover:text-white"
                                        }`}
                                >
                                    <Icon size={16} className={`${isActive ? color : "text-gray-400"}`} />
                                    {label}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h4 className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Other</h4>
                    <div className="space-y-1">
                        {otherNav.map(({ to, label, icon: Icon }) => {
                            const isActive = location.pathname === to;
                            return (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* User section */}
            <div className="px-4 pb-6 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {currentUser?.displayName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                            {currentUser?.displayName || "User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <header className="flex lg:hidden items-center gap-4 px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                            <GraduationCap size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-800 dark:text-white">PrepTrack</span>
                    </div>
                </header>

                {/* Desktop Top Bar (Search) */}
                <header className="hidden lg:flex items-center justify-end px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative w-96">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your notes, topics, code..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                        />
                        {searchQuery.trim().length >= 2 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(topic => (
                                        <button
                                            key={topic._id}
                                            onClick={() => { navigate(`/topics/${topic._id}`); setSearchQuery(""); setSearchResults([]); }}
                                            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                                        >
                                            <div className="font-semibold text-gray-800 dark:text-white text-sm">{topic.topicName}</div>
                                            <div className="text-xs text-gray-500 mt-1">{topic.subjectName}</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500">No matching notes found.</div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                        <motion.div
                            key={window.location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Outlet />
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
