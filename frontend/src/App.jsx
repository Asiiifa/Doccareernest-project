import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import { useWorkspace, WorkspaceProvider } from "./hooks/useWorkspace.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Documents from "./pages/Documents.jsx";
import CvToNotes from "./pages/CvToNotes.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import AiAssistant from "./pages/AiAssistant.jsx";
import InterviewPrep from "./pages/InterviewPrep.jsx";
import MindMaps from "./pages/MindMaps.jsx";
import Graphs from "./pages/Graphs.jsx";
import Settings from "./pages/SettingsComplete.jsx";

function DefaultLanding() {
  const { preferences } = useWorkspace();
  return <Navigate to={preferences.landingPage === "cv" ? "/resume-analyzer" : "/documents"} replace />;
}

export default function App() {
  const [stage, setStage] = useState("skeleton");

  useEffect(() => {
    const skeletonTimer = window.setTimeout(() => setStage("splash"), 550);
    const appTimer = window.setTimeout(() => setStage("app"), 2400);
    return () => {
      window.clearTimeout(skeletonTimer);
      window.clearTimeout(appTimer);
    };
  }, []);

  if (stage !== "app") {
    return <SplashScreen stage={stage} />;
  }

  return (
    <WorkspaceProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DefaultLanding />} />
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
    </WorkspaceProvider>
  );
}
