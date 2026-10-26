import { useMemo, useRef, useState } from "react";
import Filter from "lucide-react/dist/esm/icons/filter.js";
import Folder from "lucide-react/dist/esm/icons/folder.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import Upload from "lucide-react/dist/esm/icons/upload.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import StatusTag from "../components/StatusTag.jsx";
import { EmptyState, NotebookSpinner, PageSkeleton, ProgressBar } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { formatBytes } from "../data/workspaceServices.js";

export default function Documents() {
  const ready = useDelayedContent(520);
  const { files, importFiles, preferences } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [folder, setFolder] = useState("All Files");
  const [sort, setSort] = useState("modified");
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const folders = useMemo(() => ["All Files", ...Array.from(new Set(files.map((file) => file.category)))], [files]);
  const filtered = useMemo(() => files.filter((doc) => folder === "All Files" || doc.category === folder).filter((doc) => status === "All Statuses" || doc.status === status).filter((doc) => doc.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : new Date(b.modified) - new Date(a.modified)), [files, folder, query, sort, status]);

  function handleQuery(value) { setQuery(value); setSearching(true); window.clearTimeout(handleQuery.timer); handleQuery.timer = window.setTimeout(() => setSearching(false), 500); }
  function handleFiles(event) { if (!event.target.files?.length) return; setUploading(true); setProgress(20); [45, 70, 100].forEach((value, index) => window.setTimeout(() => setProgress(value), 180 * (index + 1))); window.setTimeout(() => { const records = importFiles(event.target.files, "document"); setSelected(records[0] || null); setUploading(false); setProgress(0); event.target.value = ""; }, 800); }

  if (!ready) return <PageSkeleton />;

  return (
    <div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
      <PageHeader title="Documents" subtitle="Import files, inspect real browser file metadata, and prepare records for backend indexing." action={<button onClick={() => inputRef.current?.click()} className="tap-feedback inline-flex items-center gap-2 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white"><Upload className="h-4 w-4" />Import Files</button>} />
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]"><label className="flex items-center gap-2 rounded-md border border-borderSoft bg-white px-3 py-2"><Search className="h-4 w-4 text-mutedInk" /><input value={query} onChange={(event) => handleQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search imported files..." />{searching && <NotebookSpinner label="" />}</label><button className="tap-feedback inline-flex items-center justify-center gap-2 rounded-md border border-borderSoft bg-white px-4 py-2 text-sm"><Filter className="h-4 w-4" />Filters</button><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-borderSoft bg-white px-4 py-2 text-sm outline-none"><option>All Statuses</option><option>Imported</option><option>Duplicate</option><option>Versioned</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-md border border-borderSoft bg-white px-4 py-2 text-sm outline-none"><option value="modified">Sort by Modified</option><option value="name">Sort by Name</option></select></div>
      {uploading && <div className="mb-5"><ProgressBar value={progress} label="File import" /></div>}
      <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
        <Panel className="p-4"><SectionTitle>Folders</SectionTitle><div className="mt-4 space-y-3">{folders.map((item) => <button key={item} onClick={() => setFolder(item)} className={`tap-feedback w-full rounded-lg border p-4 text-left ${folder === item ? "border-blue-200 bg-blueSoft" : "border-borderSoft bg-white/80"}`}><div className="flex items-center gap-3"><Folder className="h-5 w-5 text-blueInk" /><div><p className="font-semibold capitalize">{item}</p><p className="text-xs text-mutedInk">{item === "All Files" ? files.length : files.filter((file) => file.category === item).length} file(s)</p></div></div></button>)}</div></Panel>
        <Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-borderSoft px-4 py-3"><SectionTitle>Document List</SectionTitle><span className="text-xs text-mutedInk">{filtered.length} shown</span></div><div className={preferences.fileView === "grid" ? "grid gap-3 p-4 sm:grid-cols-2" : "grid gap-3 p-4"}>{filtered.length === 0 ? <EmptyState title={files.length ? "No documents found" : "No files imported"} message={files.length ? "Adjust the folder, status, or search phrase." : "Import files to show real filenames, size, type, and available location metadata."} action={<button onClick={() => inputRef.current?.click()} className="mt-4 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Import Files</button>} /> : filtered.map((doc) => <button key={doc.id} onClick={() => setSelected(doc)} className={`tap-feedback grid gap-3 rounded-lg border p-4 text-left ${preferences.fileView === "list" ? "md:grid-cols-[1fr_auto_auto] md:items-center" : "content-start"} ${selected?.id === doc.id ? "border-blueInk bg-blueSoft" : "border-borderSoft bg-white/80"}`}><div><p className="font-semibold">{doc.name}</p><p className="text-sm text-mutedInk">{doc.path} • {formatBytes(doc.size)} • Modified {doc.modified}</p>{doc.duplicateOf && <p className="mt-1 text-xs text-warning">Duplicate candidate of {doc.duplicateOf}</p>}</div><StatusTag status={doc.status} /><span className="rounded-md border border-borderSoft px-3 py-1 text-xs text-mutedInk">{doc.versions > 1 ? `${doc.versions} versions` : "single"}</span></button>)}</div></Panel>
      </div>
      {selected && <Panel className="mt-5 p-4"><SectionTitle>File Information</SectionTitle><div className="mt-3 grid gap-2 text-sm md:grid-cols-2"><p><span className="font-semibold">Filename:</span> {selected.name}</p><p><span className="font-semibold">Type:</span> {selected.type}</p><p><span className="font-semibold">Size:</span> {formatBytes(selected.size)}</p><p><span className="font-semibold">Modified:</span> {selected.modified}</p><p className="md:col-span-2"><span className="font-semibold">Location:</span> {selected.path}</p></div></Panel>}
    </div>
  );
}
