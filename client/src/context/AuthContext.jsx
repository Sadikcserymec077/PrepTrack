import React, { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import axios from "axios";

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [mongoUser, setMongoUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sync Firebase user to MongoDB
    const syncUserToMongo = async (firebaseUser) => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.post(
                `${API}/api/auth/sync`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMongoUser(res.data.user);
        } catch (err) {
            console.error("Error syncing user:", err);
        }
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await syncUserToMongo(user);
            } else {
                setMongoUser(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const signup = async (email, password, name) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await syncUserToMongo(cred.user);
        return cred;
    };

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const cred = await signInWithPopup(auth, googleProvider);
        await syncUserToMongo(cred.user);
        return cred;
    };

    const logout = () => {
        setMongoUser(null);
        return signOut(auth);
    };

    const getToken = async () => {
        if (!currentUser) return null;
        return currentUser.getIdToken();
    };

    return (
        <AuthContext.Provider
            value={{ currentUser, mongoUser, loading, signup, login, loginWithGoogle, logout, getToken }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
