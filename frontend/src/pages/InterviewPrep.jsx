import Mic from "lucide-react/dist/esm/icons/mic.js";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";

const levels = [
  { name: "Easy", detail: "Basic questions to build confidence." },
  { name: "Medium", detail: "Moderate level interview questions." },
  { name: "Hard", detail: "Advanced questions for experts." },
];

export default function InterviewPrep() {
  return (
    <div>
      <PageHeader title="Mock Interview" subtitle="Choose Difficulty Level" />
      <Panel className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {levels.map((level, index) => (
            <button key={level.name} className={`rounded-lg border p-6 text-center transition ${index === 1 ? "border-blueInk bg-blueSoft text-blueInk shadow-sketch" : "border-borderSoft bg-white hover:border-blue-200"}`}>
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-current">
                {index === 1 ? <PlayCircle className="h-5 w-5" /> : <span className="h-3 w-3 rounded-full border border-current" />}
              </div>
              <h2 className="hand-title text-xl font-semibold">{level.name}</h2>
              <p className="mt-2 text-sm text-mutedInk">{level.detail}</p>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button className="inline-flex items-center gap-2 rounded-md bg-blueInk px-6 py-3 text-sm font-semibold text-white">Start Interview <PlayCircle className="h-4 w-4" /></button>
        </div>
      </Panel>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
        <Panel className="p-5">
          <h2 className="hand-title mb-3 text-lg font-semibold">What to expect?</h2>
          <ul className="space-y-2 text-sm">
            <li>• AI will ask you questions</li>
            <li>• Answer as you would in a real interview</li>
            <li>• Get feedback and improvement tips</li>
          </ul>
        </Panel>
        <div className="flex items-center justify-center">
          <Mic className="h-28 w-28 rotate-[-12deg] text-blueInk" />
        </div>
      </div>
    </div>
  );
}
