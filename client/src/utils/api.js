import axios from "axios";
import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken(false);
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("[API] No current user");
        }
    } catch (e) {
        console.error("[API] Token load error:", e.message);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const msg = error.response?.data?.message || error.response?.data?.error || error.message;
        const fullErr = `${error.config?.method?.toUpperCase()} ${error.config?.url} failed: ${msg}`;
        console.error(fullErr);

        // Show an alert on the screen so we can diagnose exactly why it failed remotely
        if (!window.location.host.includes("localhost") || true) {
            window.alert(fullErr);
        }

        return Promise.reject(error);
    }
);

export default api;
