import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        document.documentElement.classList.add("dark");
        localStorage.setItem("preptrack-theme", "dark");
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark: true, toggleTheme: () => { } }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
