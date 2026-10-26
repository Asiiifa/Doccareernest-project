import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Camera from "lucide-react/dist/esm/icons/camera.js";
import Check from "lucide-react/dist/esm/icons/check.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Eye from "lucide-react/dist/esm/icons/eye.js";
import EyeOff from "lucide-react/dist/esm/icons/eye-off.js";
import LockKeyhole from "lucide-react/dist/esm/icons/lock-keyhole.js";
import Pencil from "lucide-react/dist/esm/icons/pencil.js";
import Shield from "lucide-react/dist/esm/icons/shield.js";
import Trash2 from "lucide-react/dist/esm/icons/trash-2.js";
import X from "lucide-react/dist/esm/icons/x.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import { EmptyState, ErrorState, NotebookSpinner, PageSkeleton } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { approveRoot, getApprovedRoots, getStorageStats, removeRoot, scanRoot } from "../data/backendApi.js";
import { formatBytes } from "../data/workspaceServices.js";

const tabs = ["Profile", "Preferences", "Notifications", "Security", "Storage"];
const landingOptions = [{ value: "documents", label: "File Explorer" }, { value: "cv", label: "CV Intelligence" }];

function Pending({ children = "Backend integration pending" }) {
  return <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-warning">{children}</span>;
}

function Toggle({ checked, onChange, disabled = false, label }) {
  return <button type="button" disabled={disabled} onClick={() => onChange(!checked)} className={`tap-feedback relative h-6 w-11 shrink-0 rounded-full border transition ${checked ? "border-blueInk bg-blueInk" : "border-borderSoft bg-white"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`} aria-label={label} aria-pressed={checked}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></button>;
}

function SettingRow({ title, description, children, pending = false }) {
  return <div className="flex flex-col gap-3 border-b border-borderSoft py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-mutedInk">{description}</p></div><div className="flex shrink-0 items-center gap-3">{pending && <Pending />}{children}</div></div>;
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }) {
  const mode = typeof document !== "undefined" ? document.body.dataset.settingsDialog : "";
  if (mode === "profile") return <ProfileEditDialog onClose={() => { delete document.body.dataset.settingsDialog; onClose(); }} />;
  const close = () => { delete document.body.dataset.settingsDialog; onClose(); };
  if (mode === "password") return <PasswordDialog onClose={close} onPending={() => {}} />;
  if (mode === "sessions") return <DialogShell title="Active sessions" onClose={close}><div className="space-y-4"><div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50/60 p-4 text-sm text-warning"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" /><p>Session management requires authentication backend support. No devices, locations, or sessions are available to display.</p></div><button onClick={close} className="tap-feedback rounded-md border border-borderSoft px-4 py-2 text-sm font-semibold">Close</button></div></DialogShell>;
  if (mode === "privacy") return <DialogShell title="Privacy controls" onClose={close}><div className="space-y-4"><div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50/60 p-4 text-sm text-warning"><Shield className="mt-0.5 h-5 w-5 shrink-0" /><p>Account privacy APIs are not connected. No export, deletion, or data-sharing action is available yet.</p></div><div className="rounded-md border border-borderSoft p-4"><p className="font-semibold">Local delete confirmation</p><p className="mt-1 text-sm text-mutedInk">This preference works on this device.</p></div><button onClick={close} className="tap-feedback rounded-md border border-borderSoft px-4 py-2 text-sm font-semibold">Close</button></div></DialogShell>;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="notebook-paper w-full max-w-md rounded-lg border border-borderSoft p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="confirm-title" className="hand-title text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-mutedInk">{message}</p></div><button onClick={close} className="tap-feedback rounded-md p-1 hover:bg-blueSoft" aria-label="Close dialog"><X className="h-5 w-5" /></button></div><div className="mt-5 flex justify-end gap-3"><button onClick={close} className="tap-feedback rounded-md border border-borderSoft px-4 py-2 text-sm font-semibold">Cancel</button><button onClick={onConfirm} className="tap-feedback rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white">{confirmLabel}</button></div></div></div>;
}

function DialogShell({ title, children, onClose, labelledBy = "settings-dialog-title" }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}><div className="notebook-paper max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-borderSoft p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><h2 id={labelledBy} className="hand-title text-xl font-semibold">{title}</h2><button onClick={onClose} className="tap-feedback rounded-md p-1 hover:bg-blueSoft" aria-label={`Close ${title}`}><X className="h-5 w-5" /></button></div><div className="mt-4">{children}</div></div></div>;
}

function ProfileEditDialog({ onClose }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function submit(event) {
    event.preventDefault();
    if (!displayName.trim()) return setError("Display name is required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    setError("");
    setMessage("Profile saving is awaiting authentication backend integration. Nothing was saved.");
  }
  return <DialogShell title={<span className="inline-flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Profile</span>} onClose={onClose}><form onSubmit={submit} className="space-y-4"><p className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-sm text-warning"><Pending /> <span className="ml-2">No account profile API is connected. Fields start empty.</span></p><label className="grid gap-2 text-sm">Display Name<input autoFocus value={displayName} onChange={(event) => { setDisplayName(event.target.value); setError(""); }} className="ink-focus rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" placeholder="Provided by account service" /></label><label className="grid gap-2 text-sm">Email<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} className="ink-focus rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" placeholder="Provided by account service" /></label>{error && <p className="rounded-md border border-red-200 bg-red-50/70 p-3 text-sm text-danger" role="alert">{error}</p>}{message && <p className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-sm text-warning" role="status">{message}</p>}<div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="tap-feedback rounded-md border border-borderSoft px-4 py-2 text-sm font-semibold">Cancel</button><button type="submit" className="tap-feedback inline-flex items-center gap-2 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white"><Check className="h-4 w-4" />Save Changes</button></div></form></DialogShell>;
}

function PasswordDialog({ onClose, onPending }) {
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState("");
  const fields = [["current", "Current password"], ["next", "New password"], ["confirm", "Confirm new password"]];
  function submit(event) {
    event.preventDefault();
    if (!values.current || !values.next || !values.confirm) return setError("Complete all password fields before continuing.");
    if (values.next.length < 8) return setError("New password must be at least 8 characters.");
    if (values.next !== values.confirm) return setError("New password and confirmation do not match.");
    onPending("Password update is validated locally, but no password API is connected. Nothing was changed.");
  }
  return <DialogShell title="Change password" onClose={onClose}><form onSubmit={submit} className="space-y-4">{fields.map(([key, label]) => <label key={key} className="grid gap-2 text-sm">{label}<span className="relative"><input required type={visible[key] ? "text" : "password"} value={values[key]} onChange={(event) => { setError(""); setValues((current) => ({ ...current, [key]: event.target.value })); }} className="ink-focus w-full rounded-md border border-borderSoft bg-white px-3 py-2 pr-11 outline-none" autoComplete={key === "current" ? "current-password" : "new-password"} /><button type="button" onClick={() => setVisible((current) => ({ ...current, [key]: !current[key] }))} className="tap-feedback absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mutedInk" aria-label={`${visible[key] ? "Hide" : "Show"} ${label.toLowerCase()}`}>{visible[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>)}{error && <p className="rounded-md border border-red-200 bg-red-50/70 p-3 text-sm text-danger" role="alert">{error}</p>}<p className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-sm text-warning"><Pending /> <span className="ml-2">Backend integration pending. No password will be changed here.</span></p><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="tap-feedback rounded-md border border-borderSoft px-4 py-2 text-sm font-semibold">Cancel</button><button type="submit" className="tap-feedback rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Update Password</button></div></form></DialogShell>;
}

function UnavailableSecurityAction({ label, onClick }) {
  return <button onClick={onClick} className="tap-feedback rounded-md border border-borderSoft bg-white/70 px-3 py-2 text-sm font-semibold">{label}</button>;
}

export default function SettingsComplete() {
  const ready = useDelayedContent(520);
  const { preferences, setPreferences } = useWorkspace();
  const [active, setActive] = useState("Profile");
  const [profile, setProfile] = useState({ displayName: "", email: "", bio: "", avatarUrl: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [dialog, setDialog] = useState(null);
  const avatarRef = useRef(null);
  const [storage, setStorage] = useState({ roots: [], stats: null });
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [path, setPath] = useState("");
  const [working, setWorking] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");

  useEffect(() => {
    function openProfileEditor(event) {
      const button = event.target.closest?.("button");
      if (button?.textContent?.includes("Edit Profile")) {
        document.body.dataset.settingsDialog = "profile";
        setConfirm("pending");
      }
    }
    document.addEventListener("click", openProfileEditor);
    return () => document.removeEventListener("click", openProfileEditor);
  }, []);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setDialog(null);
    }
    if (dialog) document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [dialog]);

  async function loadStorage() {
    setLoadingStorage(true);
    setStorageError(null);
    try {
      const [roots, stats] = await Promise.all([getApprovedRoots(), getStorageStats()]);
      setStorage({ roots: roots.roots || [], stats });
    } catch (error) {
      setStorageError(error.message);
    } finally {
      setLoadingStorage(false);
    }
  }

  useEffect(() => { if (active === "Storage") loadStorage(); }, [active]);

  function updatePreference(field, value) {
    setPreferences((current) => ({ ...current, [field]: value }));
    setPendingMessage("");
  }

  function updateNotification(field, value) {
    setPreferences((current) => ({ ...current, notifications: { ...current.notifications, [field]: value } }));
  }

  function handleAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfile((current) => ({ ...current, avatarUrl: url }));
    setProfileMessage("Picture preview updated locally. Account upload is pending backend integration.");
  }

  function saveProfile(event) {
    event.preventDefault();
    setProfileMessage("Profile draft is available locally. Account saving is pending authentication integration.");
    setEditingProfile(false);
  }

  function unsupported(message) {
    const mode = message.startsWith("Change password") ? "password" : message.startsWith("Active sessions") ? "sessions" : message.startsWith("Privacy controls") ? "privacy" : "";
    if (mode) {
      document.body.dataset.settingsDialog = mode;
      setPendingMessage("");
      setConfirm("pending");
      return;
    }
    setPendingMessage(message);
  }

  async function addApprovedRoot(event) {
    event.preventDefault();
    if (!path.trim()) return;
    setWorking(true); setStorageError(null); setStorageMessage("");
    try {
      await approveRoot(path.trim());
      setPath(""); setStorageMessage("Folder approved by the backend. It is ready for indexing."); await loadStorage();
    } catch (error) { setStorageError(error.message); } finally { setWorking(false); }
  }

  async function scanApprovedRoot(rootPath) {
    setWorking(true); setStorageError(null); setStorageMessage("");
    try {
      const result = await scanRoot(rootPath);
      setStorageMessage(`Re-index completed with ${result.files_indexed} indexed file(s) reported by the backend.`); await loadStorage();
    } catch (error) { setStorageError(error.message); } finally { setWorking(false); }
  }

  if (!ready) return <PageSkeleton />;

  return <div><PageHeader title="Settings" subtitle="Manage your workspace preferences and prepare account controls for connected services." />{pendingMessage && <div className="mb-5 rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-warning">{pendingMessage}</div>}{active === "Storage" && storageMessage && <div className="mb-5 rounded-md border border-green-200 bg-green-50/70 px-4 py-3 text-sm font-semibold text-success">{storageMessage}</div>}{active === "Profile" && profileMessage && <div className="mb-5 rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-warning">{profileMessage}</div>}{active === "Storage" && storageError && <div className="mb-5"><ErrorState title="Storage service unavailable" message={storageError} onRetry={loadStorage} /></div>}<div className="grid gap-5 xl:grid-cols-[1fr_320px]"><Panel className="p-5"><div className="mb-5 flex flex-wrap gap-3 border-b border-borderSoft pb-3">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`tap-feedback rounded-md px-3 py-2 text-sm ${active === tab ? "bg-blueSoft text-blueInk" : "hover:bg-white"}`}>{tab}</button>)}</div>{active === "Profile" && <form onSubmit={saveProfile} className="grid gap-5"><div className="flex flex-wrap items-center gap-4"><div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-borderSoft bg-blueSoft text-2xl font-semibold text-blueInk">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="Local profile preview" className="h-full w-full object-cover" /> : "U"}<button type="button" onClick={() => avatarRef.current?.click()} className="tap-feedback absolute bottom-0 right-0 rounded-full bg-blueInk p-1.5 text-white" aria-label="Upload profile picture"><Camera className="h-3.5 w-3.5" /></button></div><input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" /><div><h2 className="hand-title text-xl font-semibold">Profile picture</h2><p className="mt-1 text-sm text-mutedInk">Local preview only until account storage is connected.</p></div></div><div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-sm text-warning"><Pending /> <span className="ml-2">No authenticated account is connected. Empty fields are intentional.</span></div><div className="grid gap-4"><label className="grid gap-2 text-sm">Display name<input disabled={!editingProfile} value={profile.displayName} onChange={(event) => setProfile((current) => ({ ...current, displayName: event.target.value }))} className="ink-focus rounded-md border border-borderSoft bg-white px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="Provided by account service" /></label><label className="grid gap-2 text-sm">Email address<input disabled={!editingProfile} type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} className="ink-focus rounded-md border border-borderSoft bg-white px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="Provided by account service" /></label><label className="grid gap-2 text-sm">Career notes<textarea disabled={!editingProfile} value={profile.bio} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} className="ink-focus min-h-24 rounded-md border border-borderSoft bg-white px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="Optional local draft notes" /></label></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setEditingProfile((value) => !value)} className="tap-feedback rounded-md border border-borderSoft px-4 py-2 text-sm font-semibold">{editingProfile ? "Cancel Edit" : "Edit Profile"}</button><button type="submit" disabled={!editingProfile} className="tap-feedback rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Save Changes</button><button type="button" onClick={() => setConfirm("account")} className="tap-feedback inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-danger"><Trash2 className="h-4 w-4" />Delete Account</button></div></form>}{active === "Preferences" && <div className="grid gap-6"><section><h2 className="hand-title text-xl font-semibold">Appearance</h2><p className="mt-1 text-sm text-mutedInk">These choices are saved on this device.</p><div className="mt-3 grid gap-3 sm:grid-cols-3">{["light", "dark", "system"].map((theme) => <button key={theme} onClick={() => updatePreference("theme", theme)} className={`tap-feedback rounded-md border p-3 text-left capitalize ${preferences.theme === theme ? "border-blueInk bg-blueSoft text-blueInk" : "border-borderSoft bg-white/70"}`} aria-pressed={preferences.theme === theme}><span className="font-semibold">{theme}</span><span className="mt-1 block text-xs text-mutedInk">{theme === "system" ? "Follow device setting" : `Use ${theme} mode`}</span></button>)}</div></section><section><h2 className="hand-title text-xl font-semibold">Workspace defaults</h2><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm">Default landing page<select value={preferences.landingPage} onChange={(event) => updatePreference("landingPage", event.target.value)} className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none">{landingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="grid gap-2 text-sm">Default file view<select value={preferences.fileView} onChange={(event) => updatePreference("fileView", event.target.value)} className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none"><option value="list">List</option><option value="grid">Grid</option></select></label><label className="grid gap-2 text-sm">Language<select value={preferences.language} onChange={(event) => updatePreference("language", event.target.value)} className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none"><option value="system">System language</option><option value="en">English</option></select></label><label className="grid gap-2 text-sm">Date format<select value={preferences.dateFormat} onChange={(event) => updatePreference("dateFormat", event.target.value)} className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none"><option value="system">System format</option><option value="local">Local format</option><option value="iso">ISO format</option></select></label></div></section><SettingRow title="Confirm before deleting" description="Keep destructive actions behind a confirmation step."><Toggle checked={preferences.confirmDelete} onChange={(value) => updatePreference("confirmDelete", value)} label="Confirm before deleting" /></SettingRow></div>}{active === "Notifications" && <div><div className="mb-4 rounded-md border border-amber-200 bg-amber-50/60 p-3 text-sm text-warning"><Pending /> <span className="ml-2">These controls are prepared for the notification service; changing them does not send notifications yet.</span></div><SettingRow title="Enable all notifications" description="Master preference for supported workspace notifications." pending><Toggle checked={preferences.notificationsEnabled} onChange={(value) => updatePreference("notificationsEnabled", value)} label="Enable all notifications" /></SettingRow><SettingRow title="File indexing completed" description="Notify when an approved folder finishes indexing." pending><Toggle checked={preferences.notifications.indexingCompleted} onChange={(value) => updateNotification("indexingCompleted", value)} label="File indexing completed" /></SettingRow><SettingRow title="CV processing completed" description="Notify when CV processing returns a result." pending><Toggle checked={preferences.notifications.cvProcessingCompleted} onChange={(value) => updateNotification("cvProcessingCompleted", value)} label="CV processing completed" /></SettingRow><SettingRow title="Duplicate files detected" description="Notify when duplicate groups are found." pending><Toggle checked={preferences.notifications.duplicatesDetected} onChange={(value) => updateNotification("duplicatesDetected", value)} label="Duplicate files detected" /></SettingRow><SettingRow title="n8n workflow failed" description="Notify when a connected workflow reports a failure." pending><Toggle checked={preferences.notifications.workflowFailed} onChange={(value) => updateNotification("workflowFailed", value)} label="n8n workflow failed" /></SettingRow><SettingRow title="Learning reminders" description="Prepare reminders for future learning workflows." pending><Toggle checked={preferences.notifications.learningReminders} onChange={(value) => updateNotification("learningReminders", value)} label="Learning reminders" /></SettingRow></div>}{active === "Security" && <div><div className="mb-4 rounded-md border border-amber-200 bg-amber-50/60 p-3 text-sm text-warning"><Pending /> <span className="ml-2">Authentication and device-security integration is pending. No security action is simulated.</span></div><SettingRow title="Change password" description="Requires an authenticated account and password service." pending><UnavailableSecurityAction label="Change password" onClick={() => unsupported("Change password requires authentication backend integration.")} /></SettingRow><SettingRow title="Two-factor authentication" description="Requires account enrollment and verification APIs." pending><Toggle checked={false} disabled label="Two-factor authentication" /></SettingRow><SettingRow title="Biometric lock" description="Requires native device capability and secure credential storage." pending><Toggle checked={false} disabled label="Biometric lock" /></SettingRow><SettingRow title="Active sessions" description="Requires a session-management API." pending><UnavailableSecurityAction label="View sessions" onClick={() => unsupported("Active sessions require authentication backend integration.")} /></SettingRow><SettingRow title="Privacy controls" description="Requires account and data-policy services." pending><UnavailableSecurityAction label="Privacy controls" onClick={() => unsupported("Privacy controls require account and policy backend integration.")} /></SettingRow><SettingRow title="Delete account and data" description="No account data is deleted from this frontend-only action." pending><button onClick={() => setConfirm("account")} className="tap-feedback inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-danger"><Trash2 className="h-4 w-4" />Delete account and data</button></SettingRow></div>}{active === "Storage" && <div className="space-y-6">{loadingStorage && <NotebookSpinner label="Loading indexed file data..." />}{storageError && <ErrorState title="Storage service unavailable" message={storageError} onRetry={loadStorage} />}<section><h2 className="hand-title text-xl font-semibold">File intelligence</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-md border border-borderSoft bg-white/70 p-4"><p className="text-xs text-mutedInk">Indexed file count</p><p className="mt-1 text-2xl font-semibold">{storage.indexed ? storage.indexed.total : "--"}</p></div><div className="rounded-md border border-borderSoft bg-white/70 p-4"><p className="text-xs text-mutedInk">Duplicate files</p><p className="mt-1 text-2xl font-semibold">{storage.duplicates ? storage.duplicates.total_duplicate_files : "--"}</p></div><div className="rounded-md border border-borderSoft bg-white/70 p-4"><p className="text-xs text-mutedInk">Storage used</p><p className="mt-1 font-semibold">{indexedBytes === null ? "Unavailable from API" : formatBytes(indexedBytes)}</p></div></div></section><section><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="hand-title text-xl font-semibold">Approved folders</h2><p className="mt-1 text-sm text-mutedInk">Only approved folders can be scanned by the backend index.</p></div><button onClick={loadStorage} disabled={loadingStorage} className="tap-feedback rounded-md border border-borderSoft px-3 py-2 text-sm font-semibold">Refresh</button></div><form onSubmit={addApprovedRoot} className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={path} onChange={(event) => setPath(event.target.value)} className="ink-focus min-w-0 flex-1 rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" placeholder="Enter a folder path" aria-label="Folder path" /><button disabled={working || !path.trim()} className="tap-feedback rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Add approved folder</button></form><div className="mt-4 space-y-2">{!loadingStorage && storage.roots.length === 0 && <EmptyState title="No approved folders" message="Approved folders will appear here after the backend accepts a path." />}{storage.roots.map((root) => <div key={root.id} className="flex flex-col gap-3 rounded-md border border-borderSoft bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{root.path}</p><p className="text-xs text-mutedInk">Approved {new Date(root.approved_at).toLocaleString()}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => scanApprovedRoot(root.path)} disabled={working} className="tap-feedback rounded-md border border-blue-200 bg-blueSoft px-3 py-2 text-sm font-semibold text-blueInk">Re-index files</button><button onClick={() => unsupported("Removing approved folders requires a backend remove-root endpoint, which is not available yet.")} className="tap-feedback rounded-md border border-borderSoft px-3 py-2 text-sm font-semibold">Remove <Pending /></button></div></div>)}</div></section><section className="grid gap-3 sm:grid-cols-2"><Link to="/documents" className="tap-feedback flex items-center gap-3 rounded-md border border-borderSoft bg-white/70 p-4 text-sm font-semibold"><FileText className="h-5 w-5 text-blueInk" />Manage stored documents</Link><button onClick={() => unsupported("Cache clearing requires a backend cache-management endpoint, which is not available yet.")} className="tap-feedback rounded-md border border-borderSoft bg-white/70 p-4 text-left text-sm font-semibold">Clear cache <span className="mt-1 block text-xs font-normal text-mutedInk">Backend integration pending</span></button></section></div>}</Panel><aside className="space-y-5"><Panel className="p-5"><h2 className="hand-title mb-4 text-lg font-semibold">Account</h2><p className="text-sm text-mutedInk">Authentication is not connected. Profile, account, billing, and quota data are not shown as real values.</p></Panel><Panel className="p-5"><h2 className="hand-title mb-3 text-lg font-semibold">Service readiness</h2><div className="space-y-3 text-sm"><div className="flex items-center justify-between gap-3"><span>File index</span><span className="font-semibold text-success">Available</span></div><div className="flex items-center justify-between gap-3"><span>Agentic AI</span><Pending /></div><div className="flex items-center justify-between gap-3"><span>n8n workflows</span><Pending /></div></div></Panel></aside></div>{confirm && <ConfirmDialog title={confirm === "account" ? "Delete account?" : "Confirm action"} message="This frontend-only confirmation will not delete account data. Authentication and account deletion services are not connected." confirmLabel="Continue" onClose={() => setConfirm(null)} onConfirm={() => { setConfirm(null); setPendingMessage("No data was deleted. Account deletion requires authentication backend integration."); }} />}</div>;
}
