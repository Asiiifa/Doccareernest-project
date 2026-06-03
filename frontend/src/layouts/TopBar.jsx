import { NavLink } from "react-router-dom";
import Bell from "lucide-react/dist/esm/icons/bell.js";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.js";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle.js";
import Menu from "lucide-react/dist/esm/icons/menu.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import Sun from "lucide-react/dist/esm/icons/sun.js";
import Logo from "../components/Logo.jsx";

const mobileLinks = [
  ["/dashboard", "Dashboard"],
  ["/documents", "Docs"],
  ["/cv-to-notes", "CV Notes"],
  ["/assistant", "Chat"],
  ["/settings", "Settings"],
];

export default function TopBar() {
  return (
    <header className="border-b border-borderSoft bg-paper/95 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <Logo compact />
        </div>
        <div className="hidden lg:block" />
        <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-md border border-borderSoft bg-white px-3 py-2">
          <Search className="h-4 w-4 text-mutedInk" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-mutedInk" placeholder="Search files, notes, concepts..." />
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <Sun className="h-5 w-5" />
          <HelpCircle className="h-5 w-5" />
          <Bell className="h-5 w-5" />
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-blueInk text-sm font-semibold text-white">T</button>
        <ChevronDown className="hidden h-4 w-4 sm:block" />
        <Menu className="h-5 w-5 lg:hidden" />
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
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
      </nav>
    </header>
  );
}
