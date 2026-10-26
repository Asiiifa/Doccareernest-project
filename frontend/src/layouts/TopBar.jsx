import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Bell from "lucide-react/dist/esm/icons/bell.js";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.js";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle.js";
import Menu from "lucide-react/dist/esm/icons/menu.js";
import Moon from "lucide-react/dist/esm/icons/moon.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import Sun from "lucide-react/dist/esm/icons/sun.js";
import X from "lucide-react/dist/esm/icons/x.js";
import Logo from "../components/Logo.jsx";
import { NotebookSpinner } from "../components/Feedback.jsx";
import { useWorkspace } from "../hooks/useWorkspace.jsx";

const mobileLinks = [
  ["/dashboard", "Dashboard"],
  ["/documents", "Docs"],
  ["/cv-to-notes", "CV Notes"],
  ["/ai-assistant", "Chat"],
  ["/settings", "Settings"],
];

export default function TopBar() {
  const [searching, setSearching] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { preferences, setPreferences } = useWorkspace();
  const darkMode = preferences.theme === "dark" || (preferences.theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  const menuRef = useRef(null);

  useEffect(() => {
    function closeMenus(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenPanel(null);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpenPanel(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function handleSearchChange() {
    setSearching(true);
    window.clearTimeout(handleSearchChange.timer);
    handleSearchChange.timer = window.setTimeout(() => setSearching(false), 650);
  }

  function togglePanel(panel) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  function toggleTheme() {
    setPreferences((current) => ({ ...current, theme: darkMode ? "light" : "dark" }));
    setOpenPanel("theme");
  }

  return (
    <header ref={menuRef} className="relative border-b border-borderSoft bg-paper/95 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <Logo compact />
        </div>
        <div className="hidden lg:block" />
        <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-md border border-borderSoft bg-white px-3 py-2">
          <Search className="h-4 w-4 text-mutedInk" />
          <input onChange={handleSearchChange} className="w-full bg-transparent text-sm outline-none placeholder:text-mutedInk" placeholder="Search files, notes, concepts..." />
          {searching && <NotebookSpinner label="" />}
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <button onClick={toggleTheme} className="tap-feedback rounded-md p-1.5 hover:bg-blueSoft" aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={darkMode}>
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button onClick={() => togglePanel("help")} className="tap-feedback rounded-md p-1.5 hover:bg-blueSoft" aria-label="Help" aria-expanded={openPanel === "help"}>
            <HelpCircle className="h-5 w-5" />
          </button>
          <button onClick={() => togglePanel("notifications")} className="tap-feedback rounded-md p-1.5 hover:bg-blueSoft" aria-label="Notifications" aria-expanded={openPanel === "notifications"}>
            <Bell className="h-5 w-5" />
          </button>
        </div>
        <button onClick={() => togglePanel("profile")} className="tap-feedback flex h-9 w-9 items-center justify-center rounded-full bg-blueInk text-sm font-semibold text-white" aria-label="User menu" aria-expanded={openPanel === "profile"}>U</button>
        <button onClick={() => togglePanel("profile")} className="tap-feedback hidden rounded-md p-1 sm:block" aria-label="Open user menu" aria-expanded={openPanel === "profile"}><ChevronDown className="h-4 w-4" /></button>
        <button onClick={() => setMobileOpen((current) => !current)} className="tap-feedback rounded-md p-1 lg:hidden" aria-label="Toggle navigation" aria-expanded={mobileOpen}><Menu className="h-5 w-5" /></button>
      </div>
      {mobileOpen && <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
        {mobileLinks.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md border px-3 py-1.5 text-xs ${isActive ? "border-blue-200 bg-blueSoft text-blueInk" : "border-borderSoft bg-white"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>}
      {openPanel && <div className="notebook-paper absolute right-4 top-[4.5rem] z-20 w-72 rounded-lg border border-borderSoft p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="hand-title text-lg font-semibold">{openPanel === "theme" ? "Notebook Theme" : openPanel === "help" ? "Need a hand?" : openPanel === "notifications" ? "Notifications" : "Workspace Profile"}</h2>
          <button onClick={() => setOpenPanel(null)} className="tap-feedback rounded-md p-1 hover:bg-blueSoft" aria-label="Close panel"><X className="h-4 w-4" /></button>
        </div>
        {openPanel === "theme" && <div className="space-y-3 text-sm"><p className="text-mutedInk">{darkMode ? "Dark notebook theme is active." : "Light notebook theme is active."}</p><button onClick={toggleTheme} className="tap-feedback rounded-md border border-blue-200 bg-blueSoft px-3 py-2 font-semibold text-blueInk">Switch to {darkMode ? "light" : "dark"} theme</button></div>}
        {openPanel === "help" && <div className="space-y-3 text-sm"><p className="text-mutedInk">Upload a document from Documents to begin building your workspace.</p><NavLink onClick={() => setOpenPanel(null)} to="/documents" className="tap-feedback inline-block font-semibold text-blueInk">Open Documents &rarr;</NavLink></div>}
        {openPanel === "notifications" && <div className="space-y-3 text-sm"><p className="text-mutedInk">No new workspace notifications.</p><p className="border-t border-borderSoft pt-3 text-xs text-mutedInk">Processing updates will appear here when connected.</p></div>}
        {openPanel === "profile" && <div className="space-y-3 text-sm"><p className="text-mutedInk">Local workspace profile</p><NavLink onClick={() => setOpenPanel(null)} to="/settings" className="tap-feedback inline-block rounded-md bg-blueInk px-3 py-2 font-semibold text-white">Open Settings</NavLink></div>}
      </div>}
    </header>
  );
}


