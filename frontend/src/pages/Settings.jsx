import { useMemo, useState } from "react";
import Trash2 from "lucide-react/dist/esm/icons/trash-2.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import { ErrorState, NotebookSpinner, PageSkeleton, ProgressBar } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";

const tabs = ["Profile", "Preferences", "Notifications", "Security", "Storage"];

function LegacySettings() {
  const ready = useDelayedContent(520);
  const [active, setActive] = useState("Profile");
  const [form, setForm] = useState({ name: "", email: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const valid = useMemo(() => form.name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email), [form]);
  function update(field, value) { setSaved(false); setError(null); setForm((current) => ({ ...current, [field]: value })); }
  function save() { if (!valid) { setError("Enter a valid display name and email to save this local profile draft."); return; } setSaving(true); window.setTimeout(() => { setSaving(false); setSaved(true); }, 650); }

  if (!ready) return <PageSkeleton />;

  return <div><PageHeader title="Settings" subtitle="Set up local preferences. Account, storage, and security values will come from backend services when connected." />{error && <div className="mb-5"><ErrorState message={error} onRetry={() => setError(null)} /></div>}<div className="grid gap-5 xl:grid-cols-[1fr_320px]"><Panel className="p-5"><div className="mb-5 flex flex-wrap gap-3 border-b border-borderSoft pb-3">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`tap-feedback rounded-md px-3 py-2 text-sm ${active === tab ? "bg-blueSoft text-blueInk" : "hover:bg-white"}`}>{tab}</button>)}</div>{active === "Profile" ? <div className="grid gap-4"><label className="grid gap-2 text-sm">Display Name<input className="ink-focus rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Enter your name" /></label><label className="grid gap-2 text-sm">Email<input className="ink-focus rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" /></label><label className="grid gap-2 text-sm">Career Notes<textarea className="ink-focus min-h-24 rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" value={form.bio} onChange={(event) => update("bio", event.target.value)} placeholder="Add target roles, learning goals, or preferences" /></label><div className="flex items-center gap-3"><button onClick={save} disabled={saving} className="tap-feedback w-fit rounded-md bg-blueInk px-5 py-2 text-sm font-semibold text-white">{saving ? "Saving" : "Save Changes"}</button>{saving && <NotebookSpinner label="Saving..." />}{saved && <span className="text-sm font-semibold text-success">Saved locally</span>}</div></div> : <div className="notebook-paper rounded-lg border border-borderSoft p-5"><h2 className="hand-title text-xl font-semibold">{active}</h2><p className="mt-2 text-sm text-mutedInk">No account data is loaded yet. These controls are ready for backend settings integration.</p><label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" /> Enable {active.toLowerCase()} updates</label></div>}</Panel><aside className="space-y-5"><Panel className="p-5"><h2 className="hand-title mb-4 text-lg font-semibold">Account</h2><div className="space-y-4 text-sm"><div><p className="text-mutedInk">Plan</p><p className="font-semibold">Not connected</p></div><div><p className="text-mutedInk">Storage Used</p><p className="font-semibold">Unavailable until storage service is connected</p><ProgressBar value={0} label="Storage" /></div><button onClick={() => setError("Billing and storage upgrades require account services.")} className="tap-feedback text-sm font-semibold text-blueInk">Connect Account &rarr;</button></div></Panel><Panel className="p-5"><h2 className="hand-title mb-3 text-lg font-semibold">Danger Zone</h2><button onClick={() => setError("Account deletion is disabled because authentication/account services are not connected.")} className="tap-feedback inline-flex items-center gap-2 text-sm font-semibold text-danger"><Trash2 className="h-4 w-4" />Delete Account</button></Panel></aside></div></div>;
}

export { default } from "./SettingsPhaseOne.jsx";
