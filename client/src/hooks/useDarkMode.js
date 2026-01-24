/*
D:\QLDT-app\client\src\hooks\useDarkMode.js
*/

import { useState, useEffect } from 'react';

function useDarkMode() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    return [theme, () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))];
}
export default useDarkMode;