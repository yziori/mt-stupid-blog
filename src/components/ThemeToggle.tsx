import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="theme-toggle"
    >
      {dark ? "☾ dark" : "☀ light"}
      <style>{`
        .theme-toggle {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px; letter-spacing: 0.6px;
          padding: 4px 10px;
          border: 1px solid var(--ink-soft);
          background: transparent; color: var(--ink-soft);
          cursor: pointer;
          text-transform: lowercase;
          transition: color .15s, border-color .15s;
        }
        .theme-toggle:hover { color: var(--ink); border-color: var(--ink); }
      `}</style>
    </button>
  );
}
