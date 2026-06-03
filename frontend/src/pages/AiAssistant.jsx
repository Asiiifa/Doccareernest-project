import Bot from "lucide-react/dist/esm/icons/bot.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Mic from "lucide-react/dist/esm/icons/mic.js";
import Paperclip from "lucide-react/dist/esm/icons/paperclip.js";
import Send from "lucide-react/dist/esm/icons/send.js";
import UserRound from "lucide-react/dist/esm/icons/user-round.js";
import Panel from "../components/Panel.jsx";
import StickyNote from "../components/StickyNote.jsx";
import { suggestions } from "../data/mockData.js";

export default function AiAssistant() {
  return (
    <div className="grid min-h-[calc(100vh-150px)] gap-5 xl:grid-cols-[1fr_300px]">
      <Panel className="flex min-h-[620px] flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blueSoft text-blueInk"><Bot className="h-5 w-5" /></div>
            <div className="max-w-lg rounded-lg border border-borderSoft bg-white p-4 text-sm">
              <p className="hand-title text-blueInk">Hello Tushar! 👋</p>
              <p>How can I help you today?</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <div className="max-w-lg rounded-lg border border-blue-200 bg-blueSoft p-4 text-sm">Create notes from my FastAPI_Notes.pdf</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blueInk text-white"><UserRound className="h-5 w-5" /></div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blueSoft text-blueInk"><Bot className="h-5 w-5" /></div>
            <div className="max-w-2xl rounded-lg border border-borderSoft bg-white p-4 text-sm leading-6">
              <p className="mb-2 font-semibold text-blueInk">Sure! Here are your structured notes:</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>FastAPI overview with routing, async handlers, and API docs.</li>
                <li>Key features: automatic documentation, validation with Pydantic, and clean dependency injection.</li>
                <li>Revision focus: request body models, status codes, OAuth basics, and deployment notes.</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="border-t border-borderSoft bg-paper/90 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-borderSoft bg-white p-2">
            <button className="rounded-lg border border-borderSoft p-2"><Paperclip className="h-5 w-5" /></button>
            <input className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" placeholder="Ask me anything..." />
            <button className="rounded-full p-2"><Mic className="h-5 w-5" /></button>
            <button className="rounded-full bg-blueInk p-2 text-white"><Send className="h-5 w-5" /></button>
          </div>
        </div>
      </Panel>
      <aside className="space-y-5">
        <Panel className="p-4">
          <h2 className="hand-title mb-3 text-lg font-semibold">Suggested Prompts</h2>
          {suggestions.map((prompt) => (
            <button key={prompt} className="flex w-full items-center gap-3 border-b border-borderSoft py-3 text-left text-sm last:border-b-0">
              <FileText className="h-4 w-4 text-blueInk" />{prompt}
            </button>
          ))}
        </Panel>
        <StickyNote title="Tip" smile>You can upload files or ask questions to get instant help.</StickyNote>
      </aside>
    </div>
  );
}
