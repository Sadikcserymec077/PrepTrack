import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { Plus, Pencil, Trash2, X, BookOpen, CheckCircle, Search, ClipboardList } from "lucide-react";

const SUBJECTS = ["DSA", "Aptitude", "Logical Reasoning", "Verbal", "Core"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const SUBJECT_BG = { "DSA": "#4f46e5", "Aptitude": "#059669", "Logical Reasoning": "#7c3aed", "Verbal": "#db2777", "Core": "#ea580c" };
const DIFFICULTY_COLOR = { "Easy": "#4ade80", "Medium": "#facc15", "Hard": "#f87171" };

const KNOWN_TOPICS = [
    // Aptitude
    "Percentages", "Averages", "Probability", "Partnership", "Simple & Compound Interest",
    "Profit and Loss", "Ages", "Boats and Streams", "Time Speed Distance", "Ratio and proportion",
    "Problems on Trains", "Data Interpretation", "Pipes and Cisterns", "Time & Work", "Progressions",
    "Alligations and Mixtures", "Number System", "Logarithms", "Geometry", "Area, Volume and Mensuration",
    "Word Problems", "Trigonometry", "Clocks", "Calendars", "HCF & LCM",

    // Logical Reasoning
    "Blood Relations", "Direction Sense", "Coding and Decoding", "Seating and Data Arrangement",
    "Number Series", "Letter Series", "Odd Man Out", "Analogy", "Data Sufficiency",
    "Input and Output", "Puzzles", "Paper Cuts and Folds", "Decision Making", "Venn Diagram",
    "Visual Reasoning", "Logical Connectives", "Crypt Arithmetic", "Open Dice and Cubes", "Syllogisms",
    "Permutation & combination", "Indices, Surds & Simplification", "Elementary Statistics",

    // Verbal
    "Prepositions", "Articles", "Tenses", "Voice and Speech", "Para Jumbles",
    "Sentence correction & error detection", "Reading Comprehension", "Sentence Completion",
    "One word Substitution", "Sentence Improvement", "Synonyms and Antonyms", "Statement Conclusion",

    // DSA
    "Arrays", "Strings", "Linked List", "Stack", "Queue", "Binary Search",
    "Binary Search Tree (BST)", "Dynamic Programming", "Recursion", "Graphs", "Heaps", "Greedy",

    // Core
    "Operating Systems (OS)", "Database Management (DBMS)", "Computer Networks (CN)", "Object Oriented Programming (OOPs)"
];

const defaultForm = { subjectName: "DSA", topicName: "", difficultyLevel: "Medium" };

const Modal = ({ title, onClose, children }) => (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)" }} onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: "relative", background: "#1f2937", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,.8)", width: "100%", maxWidth: "480px", padding: "24px", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "white", margin: 0 }}>{title}</h3>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {children}
        </motion.div>
    </div>
);

const Topics = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTopic, setEditTopic] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSubject = searchParams.get("subject") || "All";
    const [activeSubject, setActiveSubject] = useState(urlSubject);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Update active subject when URL changes
    useEffect(() => {
        setActiveSubject(urlSubject);
    }, [urlSubject]);

    // Update URL when active subject changes via tabs
    const handleSubjectChange = (subject) => {
        setActiveSubject(subject);
        if (subject === "All") {
            setSearchParams({});
        } else {
            setSearchParams({ subject });
        }
    };
    const [error, setError] = useState("");

    const fetchTopics = useCallback(async () => {
        try {
            const res = await api.get("/api/topics");
            setTopics(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTopics(); }, [fetchTopics]);

    const openAddModal = () => { setEditTopic(null); setForm(defaultForm); setError(""); setShowModal(true); };
    const openEditModal = (t) => {
        setEditTopic(t);
        setForm({ subjectName: t.subjectName, topicName: t.topicName, difficultyLevel: t.difficultyLevel });
        setError(""); setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.topicName.trim()) return setError("Topic name is required.");
        setSaving(true); setError("");
        try {
            if (editTopic) {
                const res = await api.put(`/api/topics/${editTopic._id}`, { difficultyLevel: form.difficultyLevel });
                setTopics(topics.map(t => t._id === editTopic._id ? res.data : t));
            } else {
                const res = await api.post("/api/topics", form);
                setTopics([res.data, ...topics]);
            }
            setShowModal(false);
        } catch (e) { setError(e.response?.data?.error || "Failed to save."); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this topic forever? Notes within will be lost.")) return;
        try { await api.delete(`/api/topics/${id}`); setTopics(topics.filter(t => t._id !== id)); }
        catch (e) { console.error(e); }
    };

    const preFiltered = activeSubject === "All" ? topics : topics.filter(t => t.subjectName === activeSubject);
    const filtered = preFiltered.filter(t => t.topicName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Grouping by Date
    const groupedTopics = filtered.reduce((acc, topic) => {
        const d = new Date(topic.createdAt);
        const today = new Date().toDateString();
        const yest = new Date(Date.now() - 86400000).toDateString();
        let label = d.toDateString() === today ? "Today"
            : d.toDateString() === yest ? "Yesterday"
                : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

        if (!acc[label]) acc[label] = [];
        acc[label].push(topic);
        return acc;
    }, {});

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <div style={{ width: "32px", height: "32px", border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div style={{ fontFamily: "Inter, sans-serif" }}>
            {/* Header & Controls */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "12px" }}>
                        <ClipboardList className="text-brand-500" size={32} /> Daily Tasks
                    </h1>
                    <p style={{ fontSize: "14px", color: "#9ca3af", margin: "4px 0 0" }}>Manage your preparation modules, tasks, and notes</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                        <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: "#1f2937", border: "1px solid #374151", color: "white", padding: "8px 16px 8px 36px", borderRadius: "8px", fontSize: "14px", outline: "none", width: "220px", transition: "border-color .2s" }}
                            onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                            onBlur={(e) => e.target.style.borderColor = "#374151"}
                        />
                    </div>
                    <button onClick={openAddModal} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", height: "38px" }}>
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            {/* Subject Filter Tabs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid #374151", paddingBottom: "16px", marginBottom: "24px" }}>
                {["All", ...SUBJECTS].map(sub => (
                    <button key={sub} onClick={() => handleSubjectChange(sub)}
                        style={{
                            padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer", transition: "all .2s",
                            background: activeSubject === sub ? "#1f2937" : "transparent", color: activeSubject === sub ? "white" : "#9ca3af"
                        }}>
                        {sub} {sub !== "All" && `(${topics.filter(t => t.subjectName === sub).length})`}
                    </button>
                ))}
            </div>

            {/* Grid of Note Cards Grouped By Date */}
            {filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 20px", background: "#111827", borderRadius: "16px", border: "1px dashed #374151" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px", filter: "grayscale(1) opacity(0.5)" }}>📓</div>
                    <h3 style={{ color: "white", fontSize: "18px", fontWeight: 600, margin: "0 0 8px 0" }}>It's quiet in here...</h3>
                    <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0, textAlign: "center", maxWidth: "300px" }}>Start writing your first preparation notebook to keep your concepts organized.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {Object.entries(groupedTopics).map(([dateLabel, groupTopics]) => (
                        <div key={dateLabel}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f3f4f6", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #374151" }}>
                                {dateLabel} <span style={{ color: "#9ca3af", fontSize: "14px", fontWeight: 500, marginLeft: "8px" }}>{groupTopics.length} entries</span>
                            </h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                                <AnimatePresence>
                                    {groupTopics.map((topic, i) => {
                                        const progress = topic.totalQuestions > 0 ? (topic.solvedQuestions / topic.totalQuestions) * 100 : 0;
                                        return (
                                            <motion.div key={topic._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                                                style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "all .2s" }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = "#374151"}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = "#1f2937"}>

                                                {/* Decorative bar based on subject */}
                                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: SUBJECT_BG[topic.subjectName] || "#6366f1" }} />

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                            <span style={{ fontSize: "11px", fontWeight: 700, color: "white", padding: "2px 8px", borderRadius: "6px", background: SUBJECT_BG[topic.subjectName] || "#374151" }}>{topic.subjectName}</span>
                                                            <span style={{ fontSize: "11px", fontWeight: 600, color: DIFFICULTY_COLOR[topic.difficultyLevel] }}>{topic.difficultyLevel}</span>
                                                        </div>
                                                        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "white", margin: 0, lineHeight: 1.2 }}>{topic.topicName}</h3>
                                                    </div>
                                                    <div style={{ display: "flex", gap: "2px" }}>
                                                        <button onClick={() => openEditModal(topic)} style={{ padding: "6px", background: "none", border: "none", color: "#6b7280", cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "#white"} onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}><Pencil size={15} /></button>
                                                        <button onClick={() => handleDelete(topic._id)} style={{ padding: "6px", background: "none", border: "none", color: "#6b7280", cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}><Trash2 size={15} /></button>
                                                    </div>
                                                </div>

                                                {topic.isRevised && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6ee7b7", background: "rgba(6,78,59,.3)", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, width: "fit-content", marginBottom: "16px" }}>
                                                        <CheckCircle size={14} /> Revised ×{topic.revisionCount}
                                                    </div>
                                                )}

                                                {/* Progress minimal */}
                                                <div style={{ marginTop: "auto" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 600 }}>
                                                        <span>{progress.toFixed(0)}% Mastered</span>
                                                        <span>{topic.solvedQuestions} / {topic.totalQuestions}</span>
                                                    </div>
                                                    <div style={{ background: "#374151", height: "6px", borderRadius: "99px", overflow: "hidden", marginBottom: "16px" }}>
                                                        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
                                                    </div>
                                                </div>

                                                {/* Open Notebook Button */}
                                                <Link to={`/topics/${topic._id}`} style={{ textDecoration: "none" }}>
                                                    <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = "#374151"; e.currentTarget.style.borderColor = "#4b5563"; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.borderColor = "#374151"; }}>
                                                        <BookOpen size={16} /> Open Task
                                                    </button>
                                                </Link>

                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <Modal title={editTopic ? "Edit Task Info" : "New Daily Task"} onClose={() => setShowModal(false)}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {!editTopic && (
                                <>
                                    <div>
                                        <label className="label">Subject Tag</label>
                                        <select value={form.subjectName} onChange={e => setForm({ ...form, subjectName: e.target.value })} className="input">
                                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Topic Name</label>
                                        <input
                                            type="text"
                                            list="known-topics"
                                            placeholder="Start typing to select..."
                                            value={form.topicName}
                                            onChange={e => setForm({ ...form, topicName: e.target.value })}
                                            className="input"
                                            autoComplete="off"
                                        />
                                        <datalist id="known-topics">
                                            {KNOWN_TOPICS.map((t, i) => (
                                                <option key={i} value={t} />
                                            ))}
                                        </datalist>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="label">Difficulty</label>
                                <select value={form.difficultyLevel} onChange={e => setForm({ ...form, difficultyLevel: e.target.value })} className="input">
                                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            {error && <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>}
                            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? "Saving..." : editTopic ? "Update Task" : "Create Task"}</button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Topics;
