import { NavLink } from "react-router-dom";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3.js";
import Bot from "lucide-react/dist/esm/icons/bot.js";
import Brain from "lucide-react/dist/esm/icons/brain.js";
import BriefcaseBusiness from "lucide-react/dist/esm/icons/briefcase-business.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Folder from "lucide-react/dist/esm/icons/folder.js";
import Home from "lucide-react/dist/esm/icons/home.js";
import NotebookTabs from "lucide-react/dist/esm/icons/notebook-tabs.js";
import Settings from "lucide-react/dist/esm/icons/settings.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import Logo from "../components/Logo.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/documents", label: "Documents", icon: Folder },
  { to: "/cv-to-notes", label: "CV to Notes", icon: NotebookTabs },
  { to: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/interview-prep", label: "Interview Prep", icon: BriefcaseBusiness },
  { to: "/mind-maps", label: "Mind Maps", icon: Brain },
  { to: "/graphs", label: "Graphs", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-borderSoft bg-paper/90 p-4 lg:block">
      <Logo />
      <nav className="mt-6 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `tap-feedback flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "border border-blue-200 bg-blueSoft text-blueInk" : "text-ink hover:bg-white"}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="doodle-border mt-8 rounded-lg bg-white/70 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold"><Sparkles className="h-4 w-4 text-blueInk" />Workspace Status</div>
        <p className="text-xs text-mutedInk">Storage and account usage will appear after services are connected.</p>
        <button className="tap-feedback mt-3 text-xs font-semibold text-blueInk">Connect Services &rarr;</button>
      </div>
    </aside>
  );
}
