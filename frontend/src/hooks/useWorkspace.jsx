import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { enrichFileRecords, fileToRecord } from "../data/workspaceServices.js";

const WorkspaceContext = createContext(null);

const defaultPreferences = {
  theme: "system",
  landingPage: "documents",
  fileView: "list",
  language: "system",
  dateFormat: "system",
  confirmDelete: true,
  notificationsEnabled: true,
  notifications: {
    indexingCompleted: true,
    cvProcessingCompleted: true,
    duplicatesDetected: true,
    workflowFailed: true,
    learningReminders: true,
  },
};

function readPreferences() {
  try {
    const stored = JSON.parse(window.localStorage.getItem("doccareernest-preferences") || "{}");
    return { ...defaultPreferences, ...stored, notifications: { ...defaultPreferences.notifications, ...(stored.notifications || {}) } };
  } catch {
    return defaultPreferences;
  }
}

export function WorkspaceProvider({ children }) {
  const [rawFiles, setRawFiles] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activity, setActivity] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [mindMapNodes, setMindMapNodes] = useState([]);
  const [preferences, setPreferences] = useState(readPreferences);

  const files = useMemo(() => enrichFileRecords(rawFiles), [rawFiles]);

  useEffect(() => {
    window.localStorage.setItem("doccareernest-preferences", JSON.stringify(preferences));
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const isDark = preferences.theme === "dark" || (preferences.theme === "system" && prefersDark);
    document.body.classList.toggle("dark-theme", isDark);
  }, [preferences]);

  function importFiles(fileList, category = "document") {
    const records = Array.from(fileList || []).map((file) => fileToRecord(file, category));
    if (!records.length) return [];
    setRawFiles((current) => [...records, ...current]);
    setActivity((current) => [
      ...records.map((record) => ({ id: crypto.randomUUID(), text: `${record.name} imported`, time: new Date().toLocaleTimeString() })),
      ...current,
    ]);
    return records;
  }

  function importCv(fileList) {
    const records = importFiles(fileList, "cv");
    if (records[0]) {
      setCvFile(records[0]);
      setAnalysis(null);
      setNotes([]);
    }
    return records[0] || null;
  }

  function addActivity(text) {
    setActivity((current) => [{ id: crypto.randomUUID(), text, time: new Date().toLocaleTimeString() }, ...current]);
  }

  const value = { files, cvFile, notes, setNotes, activity, addActivity, analysis, setAnalysis, mindMapNodes, setMindMapNodes, importFiles, importCv, preferences, setPreferences };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
