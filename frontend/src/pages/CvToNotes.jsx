import { useEffect, useRef, useState } from "react";
import FileImage from "lucide-react/dist/esm/icons/file-image.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Mic from "lucide-react/dist/esm/icons/mic.js";
import NotebookTabs from "lucide-react/dist/esm/icons/notebook-tabs.js";
import Paperclip from "lucide-react/dist/esm/icons/paperclip.js";
import Send from "lucide-react/dist/esm/icons/send.js";
import Upload from "lucide-react/dist/esm/icons/upload.js";
import Panel from "../components/Panel.jsx";
import StickyNote from "../components/StickyNote.jsx";
import { EmptyState, ErrorState, NotebookSpinner, PageSkeleton, ProgressBar } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";

const actions = ["Summarize uploaded CV", "Extract skills from CV", "Generate interview questions", "Create revision sheet"];
const attach = [{ label: "Upload CV", accept: ".pdf,.doc,.docx", category: "cv", icon: Upload }, { label: "Upload PDF", accept: ".pdf", category: "document", icon: FileText }, { label: "Upload Notes", accept: ".txt,.md,.doc,.docx,.pdf", category: "notes", icon: NotebookTabs }, { label: "Upload Image", accept: "image/*", category: "image", icon: FileImage }];

export default function CvToNotes() {
  const ready = useDelayedContent(560);
  const { cvFile, importCv, importFiles, notes, setNotes, addActivity } = useWorkspace();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [accept, setAccept] = useState("*");
  const [category, setCategory] = useState("document");
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, processing]);
  useEffect(() => {
    function onPointer(event) { if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false); }
    function onKey(event) { if (event.key === "Escape") setMenuOpen(false); }
    document.addEventListener("pointerdown", onPointer); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, []);

  function openUpload(option) { setAccept(option.accept); setCategory(option.category); setMenuOpen(false); window.setTimeout(() => inputRef.current?.click(), 0); }
  function handleUpload(event) { const selected = event.target.files; if (!selected?.length) return; setError(null); setProcessing(true); setProgress(10); [35, 60, 85, 100].forEach((value, index) => window.setTimeout(() => setProgress(value), 220 * (index + 1))); window.setTimeout(() => { const record = category === "cv" ? importCv(selected) : importFiles(selected, category)[0]; setMessages((current) => [...current, { id: crypto.randomUUID(), role: "system", text: `${record?.name || "File"} imported. AI generation is ready for backend processing.` }]); addActivity(`${record?.name || "File"} imported for CV workspace`); setProcessing(false); setProgress(0); event.target.value = ""; }, 1000); }
  function sendMessage(text = input) { if (!text.trim()) return; setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text }]); setInput(""); if (!cvFile) { setError("Upload a CV before requesting personalized notes or interview material."); return; } setProcessing(true); window.setTimeout(() => { setNotes((current) => [...current, { id: crypto.randomUUID(), title: text, source: cvFile.name, status: "Ready for backend generation" }]); setMessages((current) => [...current, { id: crypto.randomUUID(), role: "system", text: "Request captured. Connect the CV intelligence API to stream generated notes from the uploaded CV." }]); setProcessing(false); }, 850); }

  if (!ready) return <PageSkeleton variant="chat" />;

  return (
    <div className="grid min-h-[calc(100vh-150px)] gap-5 xl:grid-cols-[1fr_290px]">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
      <Panel className="relative flex min-h-[620px] flex-col overflow-hidden notebook-paper"><div className="absolute left-8 top-0 hidden h-full border-r-2 border-dashed border-ink/30 md:block" /><div className="flex-1 overflow-y-auto p-6 scrollbar-thin">{messages.length === 0 ? <div className="flex min-h-[480px] items-center justify-center text-center"><EmptyState title="Upload your CV to get started" message="Personalized notes, revision sheets, and interview prep appear only after you upload a CV." action={<div className="mt-4 flex flex-wrap justify-center gap-3"><button onClick={() => openUpload(attach[0])} className="rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Upload CV</button><button onClick={() => openUpload(attach[1])} className="rounded-md border border-blue-200 bg-blueSoft px-4 py-2 text-sm font-semibold text-blueInk">Upload PDF</button></div>} /></div> : <div className="mx-auto max-w-3xl space-y-4">{messages.map((message) => <div key={message.id} className={`rounded-lg border p-4 text-sm ${message.role === "user" ? "ml-auto max-w-xl border-blue-200 bg-blueSoft" : "mr-auto max-w-2xl border-borderSoft bg-white"}`}>{message.text}</div>)}{processing && <div className="max-w-xl rounded-lg border border-borderSoft bg-white p-4"><NotebookSpinner label="Processing selected content..." /><div className="mt-3"><ProgressBar value={progress || 55} label={progress ? "Upload progress" : "AI request"} /></div></div>}<div ref={bottomRef} /></div>}</div><div className="relative border-t border-borderSoft bg-paper/90 p-4" ref={menuRef}>{menuOpen && <div className="absolute bottom-20 left-5 z-10 w-56 rounded-lg border border-borderSoft bg-white p-2 shadow-lg">{attach.map((option) => { const Icon = option.icon; return <button key={option.label} onClick={() => openUpload(option)} className="tap-feedback flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs hover:bg-blueSoft"><Icon className="h-4 w-4 text-blueInk" />{option.label}</button>; })}</div>}<div className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl border border-borderSoft bg-white p-2"><button onClick={() => setMenuOpen((open) => !open)} className="tap-feedback rounded-lg border border-borderSoft p-2"><Paperclip className="h-5 w-5" /></button><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" placeholder="Ask about your uploaded CV..." /><button className="tap-feedback rounded-full p-2"><Mic className="h-5 w-5" /></button><button onClick={() => sendMessage()} disabled={processing} className="tap-feedback rounded-full bg-blueInk p-2 text-white"><Send className="h-5 w-5" /></button></div></div></Panel>
      <aside className="space-y-4"><Panel className="p-4"><h2 className="hand-title mb-3 text-lg font-semibold">Quick Actions</h2>{actions.map((action) => <button key={action} onClick={() => sendMessage(action)} disabled={processing} className="tap-feedback flex w-full items-center gap-3 border-b border-borderSoft py-3 text-left text-sm last:border-b-0"><FileText className="h-4 w-4 text-blueInk" />{action}</button>)}</Panel>{error && <ErrorState message={error} onRetry={() => setError(null)} />}<StickyNote title="Note">This workspace stores upload state locally and waits for the backend CV intelligence service before showing generated results.</StickyNote><Panel className="p-4"><h2 className="hand-title mb-3 text-lg font-semibold">Generated Notes</h2>{notes.length === 0 ? <EmptyState title="No notes generated" message={cvFile ? "Choose a quick action to queue a note request from your uploaded CV." : "Upload a CV first, then choose a quick action to queue a note request."} action={!cvFile && <button onClick={() => openUpload(attach[0])} className="tap-feedback mt-4 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Upload CV</button>} /> : <div className="space-y-2">{notes.map((note) => <div key={note.id} className="rounded-md border border-borderSoft bg-white/70 p-3 text-sm"><p className="font-semibold">{note.title}</p><p className="mt-1 text-xs text-mutedInk">{note.status} • {note.source}</p></div>)}</div>}</Panel></aside>
    </div>
  );
}
