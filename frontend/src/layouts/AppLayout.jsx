import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-paper p-2 text-ink sm:p-4">
      <div className="notebook-paper mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1660px] overflow-hidden rounded-xl border border-borderSoft bg-paper shadow-sm sm:min-h-[calc(100vh-2rem)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-5 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
