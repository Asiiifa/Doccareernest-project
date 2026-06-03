import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Documents from "./pages/Documents.jsx";
import CvToNotes from "./pages/CvToNotes.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import AiAssistant from "./pages/AiAssistant.jsx";
import InterviewPrep from "./pages/InterviewPrep.jsx";
import MindMaps from "./pages/MindMaps.jsx";
import Graphs from "./pages/Graphs.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/cv-to-notes" element={<CvToNotes />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/assistant" element={<AiAssistant />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/mind-maps" element={<MindMaps />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
