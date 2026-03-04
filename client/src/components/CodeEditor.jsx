import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
    Play, Loader2, Terminal, ChevronDown, RotateCcw,
    CheckCircle2, XCircle, Clock, Cpu,
} from "lucide-react";

// ─── Judge0 RapidAPI config ──────────────────
const JUDGE0_URL = "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
const RAPIDAPI_KEY = "e49db6e9e2mshec7307f807db8f8p10deb8jsn5ec4e09da89b";
const RAPIDAPI_HOST = "judge029.p.rapidapi.com";

const LANGUAGES = [
    { id: 71, label: "Python", monacoLang: "python", boilerplate: `# Python Solution\ndef solution():\n    # Write your solution here\n    pass\n\nsolution()` },
    { id: 62, label: "Java", monacoLang: "java", boilerplate: `// Java Solution\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello, World!");\n    }\n}` },
    { id: 54, label: "C++", monacoLang: "cpp", boilerplate: `// C++ Solution\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    cout << "Hello, World!" << endl;\n    return 0;\n}` },
    { id: 50, label: "C", monacoLang: "c", boilerplate: `// C Solution\n#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    printf("Hello, World!\\n");\n    return 0;\n}` },
    { id: 93, label: "JavaScript", monacoLang: "javascript", boilerplate: `// JavaScript Solution\nfunction solution() {\n    // Write your solution here\n    console.log("Hello, World!");\n}\n\nsolution();` },
];

const STATUS_COLORS = {
    success: { bg: "rgba(16,185,129,.1)", border: "#10b981", text: "#6ee7b7", icon: CheckCircle2 },
    error: { bg: "rgba(239,68,68,.1)", border: "#ef4444", text: "#fca5a5", icon: XCircle },
    stderr: { bg: "rgba(245,158,11,.1)", border: "#f59e0b", text: "#fcd34d", icon: XCircle },
};

const CodeEditor = ({ initialCode = "", initialLanguage = 71, onCodeChange, onLanguageChange, topicName = "" }) => {
    const defaultLang = LANGUAGES.find(l => l.id === initialLanguage) || LANGUAGES[0];
    const [selectedLang, setSelectedLang] = useState(defaultLang);
    const [code, setCode] = useState(initialCode || defaultLang.boilerplate);
    const [stdin, setStdin] = useState("");
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);
    const [showStdin, setShowStdin] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const editorRef = useRef(null);

    const handleLangChange = (lang) => {
        setSelectedLang(lang);

        const isCodeEmpty = !code.trim();
        const isCodeBoilerplate = LANGUAGES.some(l => l.boilerplate.trim() === code.trim());

        if (isCodeEmpty || isCodeBoilerplate) {
            const newCode = lang.boilerplate;
            setCode(newCode);
            if (onCodeChange) onCodeChange(newCode);
        }

        if (onLanguageChange) onLanguageChange(lang.id);

        setShowLangMenu(false);
        setOutput(null);
    };

    const handleCodeChange = (value) => {
        setCode(value || "");
        if (onCodeChange) onCodeChange(value || "");
    };

    const runCode = async () => {
        if (!code.trim()) return;
        setRunning(true);
        setOutput(null);

        const startTime = performance.now();
        try {
            const response = await fetch(JUDGE0_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-key": RAPIDAPI_KEY,
                    "x-rapidapi-host": RAPIDAPI_HOST
                },
                body: JSON.stringify({
                    language_id: selectedLang.id,
                    source_code: code,
                    stdin: stdin || ""
                }),
            });

            const data = await response.json();
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

            const stdout = data.stdout || "";
            const stderr = data.stderr || data.compile_output || data.message || "";
            const statusId = data.status?.id;

            if (statusId !== 3 || stderr) {
                // 3 is usually "Accepted" in Judge0
                setOutput({ type: "error", content: stderr || stdout || data.status?.description || "Execution Failed", elapsed, exitCode: statusId });
            } else {
                setOutput({ type: "success", content: stdout || "(No output)", elapsed, exitCode: 0 });
            }
        } catch (err) {
            setOutput({ type: "error", content: `Network error: ${err.message}\n\nMake sure you have internet access.`, elapsed: 0, exitCode: 1 });
        } finally {
            setRunning(false);
        }
    };

    const resetCode = () => {
        const boiler = selectedLang.boilerplate;
        setCode(boiler);
        if (onCodeChange) onCodeChange(boiler);
        setOutput(null);
    };

    const statusStyle = output ? STATUS_COLORS[output.type] || STATUS_COLORS.error : null;
    const StatusIcon = statusStyle?.icon;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0", background: "#0d1117", borderRadius: "12px", overflow: "hidden", border: "1px solid #30363d" }}>

            {/* ─── Top Toolbar ─────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#161b22", borderBottom: "1px solid #30363d", flexWrap: "wrap" }}>
                {topicName && (
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#e2e8f0", marginRight: "4px" }}>
                        📘 {topicName}
                    </span>
                )}

                {/* Language Selector */}
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "#21262d", border: "1px solid #30363d", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}
                    >
                        <span style={{ fontSize: "15px" }}>
                            {selectedLang.id === 71 ? "🐍" : selectedLang.id === 62 ? "☕" : selectedLang.id === 54 ? "⚡" : selectedLang.id === 50 ? "🔧" : "🟨"}
                        </span>
                        {selectedLang.label}
                        <ChevronDown size={13} />
                    </button>
                    {showLangMenu && (
                        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, marginTop: "4px", background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", overflow: "hidden", minWidth: "150px", boxShadow: "0 16px 32px -8px rgba(0,0,0,.8)" }}>
                            {LANGUAGES.map(lang => (
                                <button key={lang.id} onClick={() => handleLangChange(lang)}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "9px 14px", background: selectedLang.id === lang.id ? "#21262d" : "none", border: "none", color: selectedLang.id === lang.id ? "#818cf8" : "#c9d1d9", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "background .15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#21262d"}
                                    onMouseLeave={e => { if (selectedLang.id !== lang.id) e.currentTarget.style.background = "none"; }}>
                                    <span>{lang.id === 71 ? "🐍" : lang.id === 62 ? "☕" : lang.id === 54 ? "⚡" : lang.id === 50 ? "🔧" : "🟨"}</span>
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Stdin toggle */}
                <button onClick={() => setShowStdin(!showStdin)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", background: showStdin ? "rgba(99,102,241,.2)" : "#21262d", border: "1px solid", borderColor: showStdin ? "#6366f1" : "#30363d", borderRadius: "8px", color: showStdin ? "#818cf8" : "#8b949e", fontSize: "12px", cursor: "pointer", transition: "all .2s" }}>
                    <Terminal size={13} />
                    stdin
                </button>

                {/* Reset */}
                <button onClick={resetCode} title="Reset to boilerplate"
                    style={{ padding: "5px 8px", background: "#21262d", border: "1px solid #30363d", borderRadius: "8px", color: "#8b949e", cursor: "pointer", display: "flex", alignItems: "center", transition: "all .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f59e0b"}
                    onMouseLeave={e => e.currentTarget.style.color = "#8b949e"}>
                    <RotateCcw size={13} />
                </button>

                {/* Run Button */}
                <button onClick={runCode} disabled={running}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 16px", background: running ? "#374151" : "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: 700, cursor: running ? "not-allowed" : "pointer", boxShadow: running ? "none" : "0 4px 12px rgba(99,102,241,.4)", transition: "all .2s" }}>
                    {running
                        ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Running...</>
                        : <><Play size={14} style={{ fill: "white" }} /> Run Code</>}
                </button>
            </div>

            {/* ─── Monaco Editor ───────────────────────────────────────── */}
            <Editor
                height="360px"
                language={selectedLang.monacoLang}
                value={code}
                onChange={handleCodeChange}
                onMount={(editor) => { editorRef.current = editor; }}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontLigatures: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    roundedSelection: true,
                    padding: { top: 12, bottom: 12 },
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    tabSize: selectedLang.id === 71 ? 4 : 2,
                    wordWrap: "on",
                    automaticLayout: true,
                    bracketPairColorization: { enabled: true },
                    guides: { bracketPairs: true },
                    renderLineHighlight: "all",
                    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                }}
            />

            {/* ─── Stdin Panel ─────────────────────────────────────────── */}
            {showStdin && (
                <div style={{ borderTop: "1px solid #30363d", padding: "10px 14px", background: "#0d1117" }}>
                    <p style={{ color: "#8b949e", fontSize: "11px", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Standard Input (stdin)
                    </p>
                    <textarea
                        value={stdin}
                        onChange={e => setStdin(e.target.value)}
                        placeholder="Enter input values here (each on a new line)..."
                        rows={3}
                        style={{ width: "100%", background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "8px 12px", color: "#e2e8f0", fontSize: "13px", fontFamily: "monospace", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    />
                </div>
            )}

            {/* ─── Output Panel ────────────────────────────────────────── */}
            {(output || running) && (
                <div style={{ borderTop: "1px solid #30363d", background: "#0d1117" }}>
                    {/* Output header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#161b22", borderBottom: "1px solid #30363d" }}>
                        <Terminal size={13} style={{ color: "#8b949e" }} />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Output</span>
                        {output && (
                            <>
                                <div style={{ flex: 1 }} />
                                {StatusIcon && <StatusIcon size={13} style={{ color: statusStyle.text }} />}
                                <span style={{ fontSize: "11px", color: statusStyle.text, fontWeight: 600 }}>
                                    {output.type === "success" ? "Success" : "Error"}
                                </span>
                                <span style={{ fontSize: "11px", color: "#6b7280", display: "flex", alignItems: "center", gap: "3px" }}>
                                    <Clock size={11} /> {output.elapsed}s
                                </span>
                                {output.exitCode !== undefined && (
                                    <span style={{ fontSize: "11px", color: "#6b7280", display: "flex", alignItems: "center", gap: "3px" }}>
                                        <Cpu size={11} /> exit: {output.exitCode}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <div style={{ padding: "12px 14px", minHeight: "60px", maxHeight: "200px", overflowY: "auto" }}>
                        {running ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6b7280", fontSize: "13px" }}>
                                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                                Executing code...
                            </div>
                        ) : output ? (
                            <pre style={{ margin: 0, color: statusStyle?.text || "#e2e8f0", fontSize: "13px", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: "1.6", background: output.type === "error" ? "rgba(239,68,68,0.05)" : "transparent", padding: "8px", borderRadius: "6px" }}>
                                {output.content || "Code execution failed with no output."}
                            </pre>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Spinner keyframes */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default CodeEditor;
