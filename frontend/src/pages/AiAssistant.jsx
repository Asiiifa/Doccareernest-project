import { useEffect, useRef, useState } from "react";
import Bot from "lucide-react/dist/esm/icons/bot.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Mic from "lucide-react/dist/esm/icons/mic.js";
import Paperclip from "lucide-react/dist/esm/icons/paperclip.js";
import Send from "lucide-react/dist/esm/icons/send.js";
import UserRound from "lucide-react/dist/esm/icons/user-round.js";
import Panel from "../components/Panel.jsx";
import StickyNote from "../components/StickyNote.jsx";
import { EmptyState, NotebookSpinner, PageSkeleton } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { createPendingResponse } from "../data/workspaceServices.js";

const suggestions = ["Find my latest resume", "Do I have duplicate resumes?", "Show files modified recently", "What can you infer after I upload my CV?"];

export default function AiAssistant() {
  const ready = useDelayedContent(540);
  const { files, cvFile } = useWorkspace();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, thinking]);

  function send(text = input) {
    if (!text.trim()) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "ai", text: createPendingResponse(text, files, cvFile) }]);
      setThinking(false);
    }, 700);
  }

  if (!ready) return <PageSkeleton variant="chat" />;

  return (
    <div className="grid min-h-[calc(100vh-150px)] gap-5 xl:grid-cols-[1fr_300px]">
      <Panel className="flex min-h-[620px] flex-col overflow-hidden"><div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">{messages.length === 0 ? <EmptyState title="Ask the Agentic AI about your files or CV" message="Import files first for metadata-aware answers. Backend streaming can plug into this chat surface later." /> : messages.map((message) => message.role === "ai" ? <div key={message.id} className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blueSoft text-blueInk"><Bot className="h-5 w-5" /></div><div className="max-w-2xl rounded-lg border border-borderSoft bg-white p-4 text-sm leading-6">{message.text}</div></div> : <div key={message.id} className="flex justify-end gap-3"><div className="max-w-lg rounded-lg border border-blue-200 bg-blueSoft p-4 text-sm">{message.text}</div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blueInk text-white"><UserRound className="h-5 w-5" /></div></div>)}{thinking && <div className="ml-12 rounded-lg border border-borderSoft bg-white p-4"><NotebookSpinner label="Checking available session data..." /></div>}<div ref={bottomRef} /></div><div className="border-t border-borderSoft bg-paper/90 p-4"><div className="flex items-center gap-2 rounded-xl border border-borderSoft bg-white p-2"><button className="tap-feedback rounded-lg border border-borderSoft p-2"><Paperclip className="h-5 w-5" /></button><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" placeholder="Ask about imported files or uploaded CV..." /><button className="tap-feedback rounded-full p-2"><Mic className="h-5 w-5" /></button><button onClick={() => send()} disabled={thinking} className="tap-feedback rounded-full bg-blueInk p-2 text-white"><Send className="h-5 w-5" /></button></div></div></Panel>
      <aside className="space-y-5"><Panel className="p-4"><h2 className="hand-title mb-3 text-lg font-semibold">Suggested Prompts</h2>{suggestions.map((prompt) => <button key={prompt} onClick={() => send(prompt)} className="tap-feedback flex w-full items-center gap-3 border-b border-borderSoft py-3 text-left text-sm last:border-b-0"><FileText className="h-4 w-4 text-blueInk" />{prompt}</button>)}</Panel><StickyNote title="Tip" smile>The assistant responds from imported session data now and is structured for backend Agentic AI later.</StickyNote></aside>
    </div>
  );
}
