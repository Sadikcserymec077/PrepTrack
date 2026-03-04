require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS — allow all localhost ports for development ────────
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl) or any localhost
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true);
        } else if (origin === process.env.CLIENT_URL) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ─── Request logger (shows every incoming request) ──────────
app.use((req, res, next) => {
    const auth = req.headers.authorization ? "✅ has token" : "❌ no token";
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path} — ${auth}`);
    next();
});

// ─── Database Connection ─────────────────────────────────────
mongoose
    .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/preptrack")
    .then(() => console.log("✅ MongoDB connected successfully."))
    .catch((err) => console.log("❌ MongoDB connection error:", err));

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/topics", require("./routes/topics"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/ai", require("./routes/ai"));

// ─── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "PrepTrack API is running 🚀", mongoStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
    });
}

module.exports = app;
