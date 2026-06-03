import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3.js";
import FileImage from "lucide-react/dist/esm/icons/file-image.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Mic from "lucide-react/dist/esm/icons/mic.js";
import NotebookTabs from "lucide-react/dist/esm/icons/notebook-tabs.js";
import Paperclip from "lucide-react/dist/esm/icons/paperclip.js";
import Send from "lucide-react/dist/esm/icons/send.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import Upload from "lucide-react/dist/esm/icons/upload.js";
import Panel from "../components/Panel.jsx";
import StickyNote from "../components/StickyNote.jsx";
import { activities } from "../data/mockData.js";

const actions = ["Summarize this CV", "Extract Skills", "Generate Interview Qs", "Create Revision Sheet"];
const attach = [
  ["Upload Resume", Upload],
  ["Upload PDF", FileText],
  ["Upload Notes", NotebookTabs],
  ["Upload Image", FileImage],
  ["Create Graph", BarChart3],
  ["Create Mind Map", Sparkles],
];

export default function CvToNotes() {
  return (
    <div className="grid min-h-[calc(100vh-150px)] gap-5 xl:grid-cols-[1fr_290px]">
      <Panel className="relative flex min-h-[620px] flex-col overflow-hidden notebook-paper">
        <div className="absolute left-8 top-0 hidden h-full border-r-2 border-dashed border-ink/30 md:block" />
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-blueInk bg-white">
              <NotebookTabs className="h-10 w-10 text-blueInk" />
            </div>
            <h1 className="hand-title text-3xl font-semibold sm:text-4xl">
              Welcome to <span className="text-blueInk underline decoration-blueInk/50">CV &rarr; Notes</span>
            </h1>
            <p className="hand-title mt-4 text-base">Turn your resume, notes, and documents into structured learning material.</p>
            <p className="hand-title mt-6 text-sm">Upload your file or ask anything to get started!</p>
          </div>
        </div>
        <div className="relative border-t border-borderSoft bg-paper/90 p-4">
          <div className="absolute bottom-20 left-5 z-10 hidden w-56 rounded-lg border border-borderSoft bg-white p-2 shadow-lg md:block">
            {attach.map(([label, Icon]) => (
              <button key={label} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs hover:bg-blueSoft">
                <Icon className="h-4 w-4 text-blueInk" />{label}
              </button>
            ))}
          </div>
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl border border-borderSoft bg-white p-2">
            <button className="rounded-lg border border-borderSoft p-2"><Paperclip className="h-5 w-5" /></button>
            <input className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" placeholder="Ask anything about your CV or notes..." />
            <button className="rounded-full p-2"><Mic className="h-5 w-5" /></button>
            <button className="rounded-full bg-blueInk p-2 text-white"><Send className="h-5 w-5" /></button>
          </div>
        </div>
      </Panel>
      <aside className="space-y-4">
        <Panel className="p-4">
          <h2 className="hand-title mb-3 text-lg font-semibold">Quick Actions</h2>
          {actions.map((action) => (
            <button key={action} className="flex w-full items-center gap-3 border-b border-borderSoft py-3 text-left text-sm last:border-b-0">
              <FileText className="h-4 w-4 text-blueInk" />{action}
            </button>
          ))}
        </Panel>
        <StickyNote title="Note">Upload your latest resume for better and more accurate notes generation.</StickyNote>
        <Panel className="p-4">
          <h2 className="hand-title mb-3 text-lg font-semibold">Recent Activity</h2>
          {activities.map((item, index) => (
            <div key={item} className="flex items-center justify-between border-b border-borderSoft py-2 text-sm last:border-b-0">
              <span>{item}</span><span className="text-xs text-mutedInk">10:{30 + index * 5} AM</span>
            </div>
          ))}
        </Panel>
      </aside>
    </div>
  );
}
