import { useState } from "react";
import Download from "lucide-react/dist/esm/icons/download.js";
import Minus from "lucide-react/dist/esm/icons/minus.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import Share2 from "lucide-react/dist/esm/icons/share-2.js";
import Undo2 from "lucide-react/dist/esm/icons/undo-2.js";
import Panel from "../components/Panel.jsx";
import { EmptyState, NotebookSpinner, PageSkeleton, ProgressBar } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";

export default function MindMaps() {
  const ready = useDelayedContent(540);
  const { mindMapNodes, setMindMapNodes, cvFile } = useWorkspace();
  const [zoom, setZoom] = useState(100);
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);

  function addNode() { setGenerating(true); window.setTimeout(() => { const node = { id: crypto.randomUUID(), label: "Untitled node", x: `${20 + mindMapNodes.length * 8}%`, y: `${20 + mindMapNodes.length * 6}%` }; setMindMapNodes((current) => [...current, node]); setSelected(node.id); setGenerating(false); }, 500); }

  if (!ready) return <PageSkeleton />;

  return (
    <Panel className="min-h-[calc(100vh-150px)] overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-borderSoft px-4 py-3"><h1 className="hand-title text-xl font-semibold">Mind Maps</h1><div className="flex items-center gap-2"><button className="rounded-md border border-borderSoft bg-white p-2"><Undo2 className="h-4 w-4" /></button><button onClick={() => setZoom((value) => Math.max(70, value - 10))} className="rounded-md border border-borderSoft bg-white p-2"><Minus className="h-4 w-4" /></button><span className="rounded-md border border-borderSoft bg-white px-3 py-2 text-xs">{zoom}%</span><button onClick={() => setZoom((value) => Math.min(140, value + 10))} className="rounded-md border border-borderSoft bg-white p-2"><Plus className="h-4 w-4" /></button><button onClick={addNode} className="rounded-md border border-borderSoft bg-white p-2"><Download className="h-4 w-4" /></button><button className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blueSoft px-3 py-2 text-sm text-blueInk"><Share2 className="h-4 w-4" />Share</button></div></div>{generating && <div className="px-4 py-3"><ProgressBar value={68} label="Mind map update" /></div>}<div className="relative min-h-[620px] overflow-hidden notebook-paper p-6">{mindMapNodes.length === 0 ? <div className="flex min-h-[560px] items-center justify-center"><EmptyState title="No mind map yet" message={cvFile ? "Create a blank node now, or connect the AI service to generate a map from your uploaded CV." : "Upload a CV or create a blank node to start building a map."} action={<button onClick={addNode} className="mt-4 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Create Blank Node</button>} /></div> : <><div className="absolute left-[45%] top-[43%] z-10 rounded-full border-2 border-blueInk bg-white px-10 py-6 text-center hand-title text-2xl font-semibold text-blueInk shadow-sketch" style={{ transform: `scale(${zoom / 100})` }}>Map</div>{mindMapNodes.map((node) => <button key={node.id} onClick={() => setSelected(node.id)} className={`absolute z-10 w-44 whitespace-pre-line rounded-md border p-3 text-left text-sm shadow-sketch ${selected === node.id ? "border-blueInk bg-blueSoft" : "border-blue-200 bg-white"}`} style={{ left: node.x, top: node.y, transform: `scale(${zoom / 100})` }}>{node.label}</button>)}<div className="mind-connector left-[40%] top-[48%] w-[18%] rotate-[18deg]" /></>}{generating && <div className="absolute bottom-5 left-5"><NotebookSpinner label="Updating map..." /></div>}</div></Panel>
  );
}
