import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import { EmptyState, ErrorState, NotebookSpinner, PageSkeleton } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { approveRoot, findDuplicates, getApprovedRoots, scanRoot, searchIndexedFiles } from "../data/backendApi.js";
import { formatBytes } from "../data/workspaceServices.js";

const tabs = ["Profile", "Preferences", "Notifications", "Security", "Storage"];
const landingOptions = [{ value: "documents", label: "File Explorer" }, { value: "cv", label: "CV Intelligence" }];

function Unavailable({ title, message, details }) {
  return <div className="notebook-paper rounded-lg border border-dashed border-borderSoft p-6"><h2 className="hand-title text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-mutedInk">{message}</p><p className="mt-4 rounded-md border border-borderSoft bg-white/60 p-3 text-xs text-mutedInk">{details}</p></div>;
}

export default function SettingsPhaseOne() {
  const ready = useDelayedContent(520);
  const { preferences, setPreferences } = useWorkspace();
  const [active, setActive] = useState("Profile");
  const [storage, setStorage] = useState({ roots: [], indexed: null, duplicates: null });
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [path, setPath] = useState("");
  const [working, setWorking] = useState(false);
  const [success, setSuccess] = useState("");

  const indexedBytes = useMemo(() => {
    if (!storage.indexed || storage.indexed.total !== storage.indexed.results.length) return null;
    return storage.indexed.results.reduce((total, file) => total + (file.size_bytes || 0), 0);
  }, [storage.indexed]);

  async function loadStorage() {
    setLoadingStorage(true);
    setStorageError(null);
    try {
      const [roots, indexed, duplicates] = await Promise.all([getApprovedRoots(), searchIndexedFiles(), findDuplicates()]);
      setStorage({ roots: roots.roots || [], indexed, duplicates });
    } catch (error) {
      setStorageError(error.message);
    } finally {
      setLoadingStorage(false);
    }
  }

  useEffect(() => {
    if (active === "Storage") loadStorage();
  }, [active]);

  function updatePreference(field, value) {
    setPreferences((current) => ({ ...current, [field]: value }));
    setSuccess("Preference saved on this device.");
    window.setTimeout(() => setSuccess(""), 2200);
  }

  async function addApprovedRoot(event) {
    event.preventDefault();
    if (!path.trim()) return;
    setWorking(true);
    setSuccess("");
    setStorageError(null);
    try {
      await approveRoot(path.trim());
      setPath("");
      setSuccess("Folder approved. You can scan it when ready.");
      await loadStorage();
    } catch (error) {
      setStorageError(error.message);
    } finally {
      setWorking(false);
    }
  }

  async function scanApprovedRoot(rootPath) {
    setWorking(true);
    setSuccess("");
    setStorageError(null);
    try {
      const result = await scanRoot(rootPath);
      setSuccess(`Scan complete: ${result.files_indexed} indexed file(s).`);
      await loadStorage();
    } catch (error) {
      setStorageError(error.message);
    } finally {
      setWorking(false);
    }
  }

  if (!ready) return <PageSkeleton />;

  return <div><PageHeader title="Settings" subtitle="Manage supported local preferences and connect settings to real workspace services." />{success && <div className="mb-5 rounded-md border border-green-200 bg-green-50/70 px-4 py-3 text-sm font-semibold text-success">{success}</div>}{active === "Storage" && storageError && <div className="mb-5"><ErrorState title="Storage service unavailable" message={storageError} onRetry={loadStorage} /></div>}<div className="grid gap-5 xl:grid-cols-[1fr_320px]"><Panel className="p-5"><div className="mb-5 flex flex-wrap gap-3 border-b border-borderSoft pb-3">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`tap-feedback rounded-md px-3 py-2 text-sm ${active === tab ? "bg-blueSoft text-blueInk" : "hover:bg-white"}`}>{tab}</button>)}</div>{active === "Profile" && <Unavailable title="Profile unavailable" message="Profile data will appear here after authentication and account services are connected." details="No name, email address, account date, or editable profile values are stored in this frontend." />}{active === "Notifications" && <Unavailable title="Notifications unavailable" message="Notification preferences are not available until a notification service is connected." details="Indexing completion, CV processing, duplicate detection, and workflow-failure notifications are reserved for the backend notification service." />}{active === "Security" && <Unavailable title="Security controls unavailable" message="Security settings will appear only when authentication and device-security APIs are available." details="Password, biometric, active-session, and account-security controls are intentionally not shown without supported services." />}{active === "Preferences" && <div className="grid gap-6"><section><h2 className="hand-title text-xl font-semibold">Appearance</h2><p className="mt-1 text-sm text-mutedInk">Choose how the notebook workspace is displayed.</p><div className="mt-3 grid gap-3 sm:grid-cols-3">{["light", "dark", "system"].map((theme) => <button key={theme} onClick={() => updatePreference("theme", theme)} className={`tap-feedback rounded-md border p-3 text-left capitalize ${preferences.theme === theme ? "border-blueInk bg-blueSoft text-blueInk" : "border-borderSoft bg-white/70"}`} aria-pressed={preferences.theme === theme}><span className="font-semibold">{theme}</span><span className="mt-1 block text-xs text-mutedInk">{theme === "system" ? "Follow device setting" : `Use ${theme} mode`}</span></button>)}</div></section><section><h2 className="hand-title text-xl font-semibold">Startup</h2><label className="mt-3 grid gap-2 text-sm">Default landing page<select value={preferences.landingPage} onChange={(event) => updatePreference("landingPage", event.target.value)} className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none">{landingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></section><section><h2 className="hand-title text-xl font-semibold">Documents</h2><label className="mt-3 grid gap-2 text-sm">Default file view<select value={preferences.fileView} onChange={(event) => updatePreference("fileView", event.target.value)} className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none"><option value="list">List</option><option value="grid">Grid</option></select></label></section></div>}{active === "Storage" && <div className="space-y-6">{loadingStorage && <NotebookSpinner label="Loading indexed file data..." />}<section><h2 className="hand-title text-xl font-semibold">Indexed file intelligence</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-md border border-borderSoft bg-white/70 p-4"><p className="text-xs text-mutedInk">Indexed files</p><p className="mt-1 text-2xl font-semibold">{storage.indexed ? storage.indexed.total : "--"}</p></div><div className="rounded-md border border-borderSoft bg-white/70 p-4"><p className="text-xs text-mutedInk">Duplicate files</p><p className="mt-1 text-2xl font-semibold">{storage.duplicates ? storage.duplicates.total_duplicate_files : "--"}</p></div><div className="rounded-md border border-borderSoft bg-white/70 p-4 sm:col-span-2"><p className="text-xs text-mutedInk">Indexed size</p><p className="mt-1 font-semibold">{indexedBytes === null ? "Unavailable from current API response" : formatBytes(indexedBytes)}</p></div></div></section><section><h2 className="hand-title text-xl font-semibold">Approved folders</h2><p className="mt-1 text-sm text-mutedInk">Only approved folders can be scanned by the backend file index.</p><form onSubmit={addApprovedRoot} className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={path} onChange={(event) => setPath(event.target.value)} className="ink-focus min-w-0 flex-1 rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" placeholder="Enter an approved folder path" aria-label="Folder path" /><button disabled={working || !path.trim()} className="tap-feedback rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Approve Folder</button></form><div className="mt-4 space-y-2">{!loadingStorage && storage.roots.length === 0 ? <EmptyState title="No approved folders" message="Approve a folder path to make it eligible for backend indexing." /> : storage.roots.map((root) => <div key={root.id} className="flex flex-col gap-3 rounded-md border border-borderSoft bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{root.path}</p><p className="text-xs text-mutedInk">Approved {new Date(root.approved_at).toLocaleString()}</p></div><button onClick={() => scanApprovedRoot(root.path)} disabled={working} className="tap-feedback rounded-md border border-blue-200 bg-blueSoft px-3 py-2 text-sm font-semibold text-blueInk">Re-index folder</button></div>)}</div></section></div>}</Panel><aside className="space-y-5"><Panel className="p-5"><h2 className="hand-title mb-4 text-lg font-semibold">Account</h2><p className="text-sm text-mutedInk">Authentication is not connected. Account plan, profile, billing, and storage quotas are unavailable.</p></Panel><Panel className="p-5"><h2 className="hand-title mb-3 text-lg font-semibold">Backend services</h2><p className="text-sm text-mutedInk">File indexing and duplicate detection are available through the connected FastAPI service. Agentic AI, n8n, notifications, and account security are not exposed by the current API.</p></Panel></aside></div></div>;
}
