import { useMemo, useRef, useState } from "react";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Info from "lucide-react/dist/esm/icons/info.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import StatusTag from "../components/StatusTag.jsx";
import StickyNote from "../components/StickyNote.jsx";
import { EmptyState, ErrorState, NotebookSpinner, PageSkeleton, ProgressBar } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { formatBytes } from "../data/workspaceServices.js";

export default function Dashboard() {
  const ready = useDelayedContent(550);
  const { files, activity, importFiles } = useWorkspace();
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => files.filter((doc) => doc.name.toLowerCase().includes(query.toLowerCase())), [files, query]);
  const duplicates = files.filter((file) => file.duplicateOf).length;
  const versioned = files.filter((file) => file.versions > 1).length;

  function handleFiles(event) {
    const selected = event.target.files;
    if (!selected?.length) return;
    setError(null);
    setUploading(true);
    setProgress(15);
    [38, 64, 86, 100].forEach((value, index) => window.setTimeout(() => setProgress(value), 180 * (index + 1)));
    window.setTimeout(() => {
      importFiles(selected, "document");
      setUploading(false);
      setProgress(0);
      event.target.value = "";
    }, 900);
  }

  if (!ready) return <PageSkeleton />;

  return (
    <div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
      <PageHeader title="DocCareerNest Workspace" subtitle="Import real files to let the workspace organize, search, and inspect your career documents." action={<button onClick={() => inputRef.current?.click()} disabled={uploading} className="tap-feedback inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blueSoft px-4 py-2 text-sm font-semibold text-blueInk"><Plus className="h-4 w-4" />{uploading ? "Importing" : "Import Files"}</button>} />
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_280px]">
        <label className="flex items-center gap-2 rounded-md border border-borderSoft bg-white px-3 py-2"><Search className="h-4 w-4 text-mutedInk" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search imported files..." /></label>
        {uploading && <ProgressBar value={progress} label="File import" />}
      </div>
      {error && <div className="mb-5"><ErrorState message={error} onRetry={() => setError(null)} /></div>}
      <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
        <div className="space-y-5">
          <Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-borderSoft px-4 py-3"><SectionTitle>Recent Documents</SectionTitle>{query && <span className="text-xs text-mutedInk">{filtered.length} found</span>}</div>{filtered.length === 0 ? <div className="p-4"><EmptyState title={files.length ? "No documents found" : "No files imported yet"} message={files.length ? "Try a different search phrase." : "Import files to populate the explorer with real file names and metadata."} action={<button onClick={() => files.length ? setQuery("") : inputRef.current?.click()} className="mt-4 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">{files.length ? "Clear Search" : "Import Files"}</button>} /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="text-xs text-mutedInk"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">AI Status</th><th className="px-4 py-3">Modified</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Info</th></tr></thead><tbody>{filtered.slice(0, 5).map((doc) => <tr key={doc.id} className="border-t border-borderSoft/70 hover:bg-white/70"><td className="px-4 py-3 font-medium"><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-blueInk" />{doc.name}</span></td><td className="px-4 py-3 text-mutedInk">{doc.type}</td><td className="px-4 py-3"><StatusTag status={doc.status} /></td><td className="px-4 py-3 text-mutedInk">{doc.modified}</td><td className="px-4 py-3 text-mutedInk">{formatBytes(doc.size)}</td><td className="px-4 py-3"><button onClick={() => setError(`${doc.name} location: ${doc.path}. Full device paths require the backend file index.`)} className="tap-feedback rounded-md p-1 hover:bg-blueSoft"><Info className="h-5 w-5" /></button></td></tr>)}</tbody></table></div>}</Panel>
          <Panel className="p-4"><SectionTitle>Recent Activity</SectionTitle>{activity.length === 0 ? <div className="mt-4"><EmptyState title="No activity yet" message="Import or analyze files to build a real activity history." /></div> : <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{activity.slice(0, 4).map((item) => <div key={item.id} className="rounded-md border border-borderSoft bg-white/75 p-3 text-sm"><FileText className="mb-2 h-4 w-4 text-blueInk" /><p className="font-medium">{item.text}</p><p className="mt-1 text-xs text-mutedInk">{item.time}</p></div>)}</div>}</Panel>
        </div>
        <aside className="space-y-5"><Panel className="p-4"><SectionTitle>AI File Intelligence</SectionTitle><div className="mt-4 space-y-3">{[{ label: `${files.length} imported file(s)`, detail: "From this browser session" }, { label: `${duplicates} duplicate candidate(s)`, detail: "Same name and size" }, { label: `${versioned} version group(s)`, detail: "Similar filename patterns" }].map((insight) => <div key={insight.label} className="rounded-md border border-borderSoft bg-white/80 p-3"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-blueInk" />{insight.label}</div><p className="mt-1 text-xs text-mutedInk">{insight.detail}</p></div>)}</div></Panel><StickyNote>Tip: Device-wide search and exact saved paths are ready for backend file-index integration. Browser uploads only expose safe session metadata.</StickyNote>{uploading && <NotebookSpinner label="Reading selected files..." />}</aside>
      </div>
    </div>
  );
}
