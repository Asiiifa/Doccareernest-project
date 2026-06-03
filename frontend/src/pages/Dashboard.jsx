import FileText from "lucide-react/dist/esm/icons/file-text.js";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import StatusTag from "../components/StatusTag.jsx";
import StickyNote from "../components/StickyNote.jsx";
import { activities, documents } from "../data/mockData.js";

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back, Tushar! 👋"
        subtitle="Here's what's happening with your career workspace."
        action={<button className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blueSoft px-4 py-2 text-sm font-semibold text-blueInk"><Plus className="h-4 w-4" />Upload New</button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-borderSoft px-4 py-3">
              <SectionTitle>Recent Documents</SectionTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs text-mutedInk">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">AI Status</th>
                    <th className="px-4 py-3">Last Modified</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.slice(0, 5).map((doc) => (
                    <tr key={doc.name} className="border-t border-borderSoft/70">
                      <td className="px-4 py-3 font-medium"><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-blueInk" />{doc.name}</span></td>
                      <td className="px-4 py-3 text-mutedInk">{doc.type}</td>
                      <td className="px-4 py-3"><StatusTag status={doc.status} /></td>
                      <td className="px-4 py-3 text-mutedInk">{doc.modified}</td>
                      <td className="px-4 py-3"><MoreHorizontal className="h-5 w-5" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel className="p-4">
            <SectionTitle>Recent Activity</SectionTitle>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {activities.map((item, index) => (
                <div key={item} className="rounded-md border border-borderSoft bg-white/75 p-3 text-sm">
                  <FileText className="mb-2 h-4 w-4 text-blueInk" />
                  <p className="font-medium">{item}</p>
                  <p className="mt-1 text-xs text-mutedInk">{index < 2 ? "10:30 AM" : "Yesterday"}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <aside className="space-y-5">
          <Panel className="p-4">
            <SectionTitle>AI Insights</SectionTitle>
            <div className="mt-4 space-y-3">
              {["2 files are outdated", "3 new suggestions", "1 skill gap found"].map((insight) => (
                <div key={insight} className="rounded-md border border-borderSoft bg-white/80 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-blueInk" />{insight}</div>
                  <button className="mt-2 text-xs font-semibold text-blueInk">Review Now &rarr;</button>
                </div>
              ))}
            </div>
          </Panel>
          <StickyNote>
            Tip: Keep your resume updated to get better AI suggestions.
          </StickyNote>
        </aside>
      </div>
    </div>
  );
}
