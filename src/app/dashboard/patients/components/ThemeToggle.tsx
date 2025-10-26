export default function ThemeToggle({
    darkMode,
    setDarkMode,
  }: {
    darkMode: boolean;
    setDarkMode: (v: boolean) => void;
  }) {
    return (
      <button
        onClick={() => {
          const next = !darkMode;
          setDarkMode(next);
          localStorage.setItem("theme", next ? "dark" : "light");
          document.documentElement.classList.toggle("dark", next);
        }}
        className="p-2 rounded-md border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-neutral-800 transition"
        title="Toggle theme"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    );
  }