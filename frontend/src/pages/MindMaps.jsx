import Download from "lucide-react/dist/esm/icons/download.js";
import Minus from "lucide-react/dist/esm/icons/minus.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import Share2 from "lucide-react/dist/esm/icons/share-2.js";
import Undo2 from "lucide-react/dist/esm/icons/undo-2.js";
import Panel from "../components/Panel.jsx";

const nodes = [
  { label: "1. Basics\nInstallation\nFirst App\nRouting", x: "8%", y: "16%" },
  { label: "2. Core Concepts\nPath Parameters\nQuery Params\nRequest Body", x: "8%", y: "62%" },
  { label: "3. Database\nSQLAlchemy\nCRUD Operations", x: "43%", y: "76%" },
  { label: "4. Advanced\nAuthentication\nMiddleware\nBackground Tasks", x: "72%", y: "15%" },
  { label: "5. Deployment\nDocker\nNginx\nAWS / Cloud", x: "75%", y: "60%" },
];

export default function MindMaps() {
  return (
    <Panel className="min-h-[calc(100vh-150px)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borderSoft px-4 py-3">
        <h1 className="hand-title text-xl font-semibold">FastAPI Mind Map</h1>
        <div className="flex items-center gap-2">
          {[Undo2, Minus, Plus, Download].map((Icon, index) => (
            <button key={index} className="rounded-md border border-borderSoft bg-white p-2"><Icon className="h-4 w-4" /></button>
          ))}
          <button className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blueSoft px-3 py-2 text-sm text-blueInk"><Share2 className="h-4 w-4" />Share</button>
        </div>
      </div>
      <div className="relative min-h-[620px] overflow-hidden notebook-paper p-6">
        <div className="absolute left-[45%] top-[43%] z-10 rounded-full border-2 border-blueInk bg-white px-10 py-6 text-center hand-title text-2xl font-semibold text-blueInk shadow-sketch">FastAPI</div>
        {nodes.map((node, index) => (
          <div key={node.label} className="absolute z-10 w-44 whitespace-pre-line rounded-md border border-blue-200 bg-white p-3 text-sm shadow-sketch" style={{ left: node.x, top: node.y }}>
            {node.label}
          </div>
        ))}
        <div className="mind-connector left-[29%] top-[35%] w-[20%] rotate-[18deg]" />
        <div className="mind-connector left-[29%] top-[63%] w-[20%] -rotate-[22deg]" />
        <div className="mind-connector left-[52%] top-[66%] w-[18%] rotate-[42deg]" />
        <div className="mind-connector left-[56%] top-[37%] w-[18%] -rotate-[25deg]" />
        <div className="mind-connector left-[56%] top-[55%] w-[18%] rotate-[10deg]" />
      </div>
    </Panel>
  );
}
