import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { motion } from "framer-motion";
import api from "../../utils/api";
import CodeEditor from "../../components/CodeEditor";
import { ArrowLeft, CheckCircle2, RotateCcw, Clock, Target, CalendarDays, Loader2, Save, Youtube, Plus, Trash2, Sparkles } from "lucide-react";

const DIFFICULTY_COLOR = { "Easy": "#4ade80", "Medium": "#facc15", "Hard": "#f87171" };

const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

// Quill modules config for Notion-like features
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
    ]
};

const TopicDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("notes");
    const [saving, setSaving] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState(null);

    // Form State for controlled inputs
    const [formData, setFormData] = useState({
        notesHTML: "",
        revisionNotesHTML: "",
        youtubeUrl: "",
        difficultyLevel: "Medium",
        questions: []
    });
    const [activeQIndex, setActiveQIndex] = useState(-1);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const askAiForHelp = async (q, index) => {
        setIsAiLoading(true);
        try {
            const res = await api.post("/api/ai/summarize", {
                title: q.title,
                difficulty: q.difficulty,
                codeSolution: q.codeSolution,
                input: q.input,
                output: q.output
            });

            setFormData(prev => {
                const updated = [...prev.questions];
                const existingQ = updated[index];
                updated[index] = {
                    ...existingQ,
                    approachHTML: (existingQ.approachHTML || "") + res.data.approachHTML,
                    edgeCasesHTML: (existingQ.edgeCasesHTML || "") + res.data.edgeCasesHTML
                };
                return { ...prev, questions: updated };
            });
        } catch (err) {
            console.error(err);
            alert("Failed to analyze code. Make sure GEMINI_API_KEY is configured on the backend!");
        } finally {
            setIsAiLoading(false);
        }
    };

    const fetchTopic = useCallback(async () => {
        try {
            const res = await api.get(`/api/topics/${id}`);
            setTopic(res.data);
            setFormData({
                notesHTML: res.data.notesHTML || "",
                revisionNotesHTML: res.data.revisionNotesHTML || "",
                youtubeUrl: res.data.youtubeUrl || "",
                difficultyLevel: res.data.difficultyLevel || "Medium",
                questions: res.data.questions || []
            });
        } catch (err) {
            console.error(err);
            navigate("/topics"); // Go back if error
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchTopic();
    }, [fetchTopic]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/api/topics/${id}`, formData);
            setTopic(res.data);
            setLastSavedTime(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Save failed", err);
        } finally {
            setSaving(false);
        }
    };

    const markRevised = async () => {
        try {
            const res = await api.put(`/api/topics/${id}`, { isRevised: true });
            setTopic(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addNewQuestion = () => {
        const newQ = { title: "Untitled Problem", difficulty: "Medium", approachHTML: "", edgeCasesHTML: "", codeSolution: "", youtubeUrl: "" };
        setFormData(prev => ({ ...prev, questions: [newQ, ...prev.questions] }));
        setActiveQIndex(0);
    };

    const updateActiveQuestion = (field, value) => {
        setFormData(prev => {
            const updated = [...prev.questions];
            updated[activeQIndex] = { ...updated[activeQIndex], [field]: value };
            return { ...prev, questions: updated };
        });
    };

    const deleteQuestion = (index) => {
        if (!window.confirm("Delete this practiced problem?")) return;
        setFormData(prev => {
            const qs = prev.questions.filter((_, i) => i !== index);
            return { ...prev, questions: qs };
        });
        setActiveQIndex(-1);
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    const isDSA = topic?.subjectName === "DSA";

    // Tabs Definition
    const tabs = [
        { id: "notes", label: "📄 Concept Notes" },
        { id: "questions", label: "📝 Practiced Questions" },
        { id: "revision", label: "🔁 Revision Summary" },
        { id: "analytics", label: "📊 Analytics" }
    ];

    // Dynamic progress bar
    const progressPercent = topic.isRevised ? 100 : Math.min(100, (topic.questions?.length > 0 ? 100 : 0));

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 60px" }}>

            {/* ─── Breadcrumb & Save Bar ─── */}
            <div className="top-bar-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "24px 0", position: "sticky", top: 0, background: "rgba(3,7,18,0.8)", backdropFilter: "blur(12px)", padding: "16px 0", zIndex: 30, borderBottom: "1px solid #1f2937" }}>
                <button onClick={() => navigate("/topics")} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Topics
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {lastSavedTime && <span style={{ color: "#6b7280", fontSize: "13px" }}>Last saved: {lastSavedTime}</span>}
                    <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Notes"}
                    </button>
                </div>
            </div>

            {/* ─── Header Section (Notion Style) ─── */}
            <div style={{ marginBottom: "32px", padding: "0 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <span style={{ background: "#4f46e5", color: "white", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>
                        {topic.subjectName}
                    </span>
                    <span style={{ background: "#374151", color: "#e5e7eb", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}>
                        {formData.difficultyLevel}
                    </span>
                </div>
                <h1 className="topic-title">
                    {topic.topicName}
                </h1>

                <div style={{ display: "flex", gap: "32px", color: "#9ca3af", fontSize: "14px", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><CalendarDays size={16} /> Created: {new Date(topic.createdAt).toLocaleDateString()}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><RotateCcw size={16} /> Revisions: {topic.revisionCount}</div>
                </div>
            </div>

            {/* ─── Custom Tab Navigation ─── */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #374151", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "10px 16px", background: activeTab === tab.id ? "#1f2937" : "transparent",
                            color: activeTab === tab.id ? "#818cf8" : "#9ca3af", borderRadius: "8px",
                            border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                            transition: "all .2s"
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── Editor Viewport ─── */}
            <div className="notion-editor-wrapper">

                {/* TAB: Concept Notes */}
                {activeTab === "notes" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#111827", padding: "12px 16px", borderRadius: "12px", border: "1px solid #1f2937" }}>
                                <Youtube size={20} color="#ef4444" />
                                <input
                                    type="text"
                                    placeholder="Paste reference YouTube Video URL here..."
                                    value={formData.youtubeUrl}
                                    onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                    style={{ flex: 1, background: "transparent", border: "none", color: "white", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                                />
                            </div>
                            {getYouTubeEmbedUrl(formData.youtubeUrl) && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: "16px", borderRadius: "12px", overflow: "hidden", border: "1px solid #1f2937", background: "black" }}>
                                    <iframe
                                        width="100%"
                                        height="450"
                                        src={getYouTubeEmbedUrl(formData.youtubeUrl)}
                                        title="YouTube Review Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ display: "block" }}
                                    ></iframe>
                                </motion.div>
                            )}
                        </div>

                        <ReactQuill
                            theme="snow"
                            value={formData.notesHTML}
                            onChange={val => setFormData({ ...formData, notesHTML: val })}
                            modules={modules}
                            placeholder="Write your comprehensive concept notes here. Use headings, lists, code blocks, or upload images..."
                        />
                    </motion.div>
                )}

                {/* TAB: Practiced Questions */}
                {activeTab === "questions" && (
                    <div style={{ display: "flex", gap: "24px", minHeight: "500px", alignItems: "flex-start", flexWrap: "wrap" }}>
                        {/* Sidebar */}
                        <div style={{ flex: "1 1 250px", maxWidth: "300px", background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "80px" }}>
                            <button onClick={addNewQuestion} className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", height: "40px" }}>
                                <Plus size={16} /> Add New Problem
                            </button>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
                                {formData.questions.map((q, i) => (
                                    <div key={i} onClick={() => setActiveQIndex(i)} style={{ padding: "12px", background: activeQIndex === i ? "#374151" : "transparent", borderRadius: "8px", cursor: "pointer", transition: "all .2s", border: "1px solid", borderColor: activeQIndex === i ? "#6366f1" : "transparent" }}>
                                        <div style={{ fontSize: "14px", fontWeight: 600, color: "white", marginBottom: "4px" }}>{q.title || "Untitled Problem"}</div>
                                        <div style={{ fontSize: "12px", color: DIFFICULTY_COLOR[q.difficulty] || "#9ca3af" }}>{q.difficulty}</div>
                                    </div>
                                ))}
                                {formData.questions.length === 0 && (
                                    <div style={{ color: "#9ca3af", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>No problems practiced yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Question Editor */}
                        <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "24px", padding: "16px", background: "#111827", borderRadius: "12px", border: "1px solid #1f2937" }}>
                            {activeQIndex >= 0 && formData.questions[activeQIndex] ? (() => {
                                const q = formData.questions[activeQIndex];
                                return (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={activeQIndex} style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", maxWidth: "100%" }}>
                                        {/* Problem Header */}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid #374151", paddingBottom: "16px" }}>
                                            <input type="text" value={q.title} onChange={e => updateActiveQuestion("title", e.target.value)} placeholder="Problem Title..." style={{ background: "transparent", border: "none", color: "white", fontSize: "24px", fontWeight: 800, outline: "none", flex: 1, minWidth: "200px" }} />
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <select value={q.difficulty} onChange={e => updateActiveQuestion("difficulty", e.target.value)} style={{ background: "#1f2937", color: "white", border: "1px solid #374151", padding: "6px 16px", borderRadius: "6px", outline: "none", fontSize: "13px", height: "36px" }}>
                                                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                                                </select>
                                                <button onClick={() => deleteQuestion(activeQIndex)} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 0.8} onMouseLeave={e => e.currentTarget.style.opacity = 1}><Trash2 size={16} /></button>
                                            </div>
                                        </div>

                                        {/* Youtube Embed Field */}
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#030712", padding: "12px 16px", borderRadius: "8px", border: "1px solid #1f2937" }}>
                                                <Youtube size={16} color="#ef4444" />
                                                <input type="text" placeholder="Video Solution URL (optional)" value={q.youtubeUrl} onChange={e => updateActiveQuestion("youtubeUrl", e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: "white", outline: "none", fontSize: "14px" }} />
                                            </div>
                                            {getYouTubeEmbedUrl(q.youtubeUrl) && (
                                                <div style={{ marginTop: "16px", borderRadius: "8px", overflow: "hidden", border: "1px solid #1f2937", background: "black" }}>
                                                    <iframe width="100%" height="350" src={getYouTubeEmbedUrl(q.youtubeUrl)} title="Video Solution" frameBorder="0" allowFullScreen style={{ display: "block" }}></iframe>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rich Text Fields & I/O Grid */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                                    <h3 style={{ color: "white", fontWeight: 700, fontSize: "16px", margin: 0 }}>🧠 Approach / Intuition</h3>
                                                    <button onClick={() => askAiForHelp(q, activeQIndex)} disabled={isAiLoading} style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(to right, #6366f1, #a855f7)", color: "white", border: "none", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, cursor: isAiLoading ? "not-allowed" : "pointer", opacity: isAiLoading ? 0.7 : 1 }}>
                                                        {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                        {isAiLoading ? "Analyzing Code..." : "Ask AI to Summarize"}
                                                    </button>
                                                </div>
                                                <ReactQuill theme="snow" value={q.approachHTML} onChange={val => updateActiveQuestion("approachHTML", val)} modules={modules} placeholder="Write down the step by step intuition used to solve this problem..." />
                                            </div>

                                            {/* Side by side Input/Output and Edge Cases */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                                <div>
                                                    <h3 style={{ color: "white", marginBottom: "12px", fontWeight: 700, fontSize: "16px" }}>📝 Input & Output</h3>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                        <textarea
                                                            value={q.input || ""}
                                                            onChange={val => updateActiveQuestion("input", val.target.value)}
                                                            placeholder="Example Input (e.g. arr = [1,2,3])"
                                                            style={{ width: "100%", height: "80px", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "white", fontSize: "14px", resize: "none", outline: "none", fontFamily: "monospace" }}
                                                        />
                                                        <textarea
                                                            value={q.output || ""}
                                                            onChange={val => updateActiveQuestion("output", val.target.value)}
                                                            placeholder="Example Output (e.g. 6)"
                                                            style={{ width: "100%", height: "80px", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "#4ade80", fontSize: "14px", resize: "none", outline: "none", fontFamily: "monospace" }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 style={{ color: "white", marginBottom: "12px", fontWeight: 700, fontSize: "16px" }}>⚠️ Edge Cases</h3>
                                                    <ReactQuill theme="snow" value={q.edgeCasesHTML} onChange={val => updateActiveQuestion("edgeCasesHTML", val)} modules={modules} placeholder="What constraints and edge cases did you consider?" />
                                                </div>
                                            </div>

                                            <div style={{ margin: "0 -16px", borderTop: "1px dashed #374151", paddingTop: "24px" }}>
                                                <h3 style={{ color: "white", marginBottom: "16px", fontWeight: 700, fontSize: "16px", padding: "0 16px" }}>💻 Code Editor</h3>
                                                <CodeEditor initialCode={q.codeSolution} onCodeChange={val => updateActiveQuestion("codeSolution", val)} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })() : (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "64px 0", color: "#6b7280", flexDirection: "column", gap: "16px", border: "1px dashed #374151", borderRadius: "8px" }}>
                                    <Target size={48} opacity={0.3} />
                                    <span style={{ fontSize: "15px", fontWeight: 500 }}>Select a problem or add a new one to document its solution.</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: Revision Summary */}
                {activeTab === "revision" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ background: "#111827", padding: "24px", borderRadius: "12px", border: "1px solid #1f2937", marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <div>
                                    <h3 style={{ margin: 0, color: "white", fontSize: "18px" }}>Spaced Repetition</h3>
                                    <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "13px" }}>Last revised: {topic.lastRevised ? new Date(topic.lastRevised).toLocaleDateString() : 'Never'}</p>
                                </div>
                                <button onClick={markRevised} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#059669", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                                    <CheckCircle2 size={16} /> Mark as Revised Today
                                </button>
                            </div>
                        </div>

                        <h3 style={{ color: "white", marginBottom: "8px", fontWeight: 700, fontSize: "18px" }}>🧾 Quick Summary</h3>
                        <ReactQuill theme="snow" value={formData.revisionNotesHTML} onChange={val => setFormData({ ...formData, revisionNotesHTML: val })} modules={modules} placeholder="Write highly condensed bullet points for last-minute revision..." />
                    </motion.div>
                )}

                {/* TAB: Analytics */}
                {activeTab === "analytics" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="analytics-grid">
                            <div className="card">
                                <label className="label">Total Questions Discovered</label>
                                <input type="number" className="input text-xl font-bold" value={formData.totalQuestions} onChange={e => setFormData({ ...formData, totalQuestions: e.target.value })} />
                            </div>
                            <div className="card">
                                <label className="label">Questions Solved</label>
                                <input type="number" className="input text-xl font-bold text-indigo-400" value={formData.solvedQuestions} onChange={e => setFormData({ ...formData, solvedQuestions: e.target.value })} />
                            </div>
                        </div>
                        <div className="card">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Target size={18} /> Topic Mastery</h4>
                            <div style={{ height: "12px", background: "#374151", borderRadius: "99px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${progressPercent}%`, background: "linear-gradient(90deg, #6366f1, #10b981)", transition: "width 0.5s" }}></div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-gray-400">
                                <span>{progressPercent.toFixed(0)}% Mastered</span>
                                <span>{formData.questions.length} / {topic.questions?.length || formData.questions.length} Questions</span>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Quill global overrides for Dark Mode */}
            <style>{`
        .notion-editor-wrapper .ql-container.ql-snow {
           border: none !important;
           font-family: 'Inter', sans-serif;
           font-size: 15px;
           color: #f3f4f6;
           min-height: 400px;
        }
        .notion-editor-wrapper .ql-toolbar.ql-snow {
           border: none !important;
           border-bottom: 1px solid #1f2937 !important;
           background: #111827;
           border-radius: 12px 12px 0 0;
           padding: 12px;
           position: sticky;
           top: 72px;
           z-index: 25;
        }
        .notion-editor-wrapper .ql-editor { padding: 24px; }
        .notion-editor-wrapper .ql-editor.ql-blank::before { color: #4b5563; font-style: italic; }
        /* Icon color inversion for dark mode */
        .ql-snow .ql-stroke { stroke: #9ca3af; }
        .ql-snow .ql-fill { fill: #9ca3af; }
        .ql-snow .ql-picker { color: #9ca3af; }
        .ql-snow .ql-picker-options { background-color: #1f2937 !important; border-color: #374151 !important; color: white !important;}
        
        .ql-editor h1 { font-size: 2em; font-weight: 800; margin-bottom: 0.5em; border-bottom: 1px solid #374151; padding-bottom: 8px;}
        .ql-editor h2 { font-size: 1.5em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
        .ql-editor pre.ql-syntax { background: #0d1117 !important; border: 1px solid #30363d; border-radius: 8px; padding: 16px; color: #e5e7eb; font-family: monospace; font-size: 13px;}
        .ql-editor blockquote { border-left: 4px solid #6366f1 !important; padding-left: 16px; margin-left: 0; color: #9ca3af; font-style: italic; }
        
        /* Inline Image Styling */
        .ql-editor img { border-radius: 8px; max-width: 100%; height: auto; margin: 16px 0; cursor: pointer; transition: outline .2s; outline: 2px solid transparent; }
        .ql-editor img:hover { outline: 2px solid #6366f1; }
        
        /* Responsive Fixes */
        .topic-title { font-size: 42px; font-weight: 900; color: white; margin: 0 0 16px 0; letter-spacing: -0.02em; line-height: 1.1; }
        .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        
        @media (max-width: 768px) {
           .topic-title { font-size: 28px; }
           .analytics-grid { grid-template-columns: 1fr; gap: 16px; }
           .notion-editor-wrapper .ql-toolbar.ql-snow { top: 60px; z-index: 25; }
           .notion-editor-wrapper .ql-editor { padding: 16px 12px; font-size: 16px; min-height: 250px; }
           .ql-editor h1 { font-size: 1.6em; }
           .top-bar-container { flex-direction: column; align-items: flex-start !important; gap: 12px; }
           .top-bar-container > div { width: 100%; justify-content: space-between; }
        }
        
        /* Inline Image Styling */
        .ql-editor img {
            border-radius: 8px;
            max-width: 100%;
            height: auto;
            margin: 16px 0;
            cursor: pointer;
            transition: outline .2s;
            outline: 2px solid transparent;
        }
        .ql-editor img:hover {
            outline: 2px solid #6366f1;
        }
      `}</style>
        </div>
    );
};

export default TopicDetail;
