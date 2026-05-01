import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme(): [Theme, () => void] {
    const [theme, setTheme] = useState<Theme>( () => {
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored === "dark" || stored === "light") return stored;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => prevTheme === "light" ? "dark" : "light");
    };

    return [theme, toggleTheme];
}