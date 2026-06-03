import Trash2 from "lucide-react/dist/esm/icons/trash-2.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";

const tabs = ["Profile", "Preferences", "Notifications", "Security", "Storage"];

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences, notifications, storage, and security." />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Panel className="p-5">
          <div className="mb-5 flex flex-wrap gap-3 border-b border-borderSoft pb-3">
            {tabs.map((tab, index) => (
              <button key={tab} className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-blueSoft text-blueInk" : "hover:bg-white"}`}>{tab}</button>
            ))}
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">Full Name<input className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" value="Tushar" readOnly /></label>
            <label className="grid gap-2 text-sm">Email<input className="rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" value="tushar@example.com" readOnly /></label>
            <label className="grid gap-2 text-sm">Bio<textarea className="min-h-24 rounded-md border border-borderSoft bg-white px-3 py-2 outline-none" value="Aspiring Backend Developer | Python | FastAPI Enthusiast" readOnly /></label>
            <button className="w-fit rounded-md bg-blueInk px-5 py-2 text-sm font-semibold text-white">Save Changes</button>
          </div>
        </Panel>
        <aside className="space-y-5">
          <Panel className="p-5">
            <h2 className="hand-title mb-4 text-lg font-semibold">Account</h2>
            <div className="space-y-4 text-sm">
              <div><p className="text-mutedInk">Plan</p><p className="font-semibold">Free Plan</p></div>
              <div>
                <p className="text-mutedInk">Storage Used</p>
                <p className="font-semibold">7.4 GB / 15 GB <span className="text-blueInk">49%</span></p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full w-[49%] rounded-full bg-blueInk" /></div>
              </div>
              <button className="text-sm font-semibold text-blueInk">Upgrade Plan &rarr;</button>
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="hand-title mb-3 text-lg font-semibold">Danger Zone</h2>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-danger"><Trash2 className="h-4 w-4" />Delete Account</button>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
