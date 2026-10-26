import { useState } from "react";
import Mic from "lucide-react/dist/esm/icons/mic.js";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import { EmptyState, ErrorState, NotebookSpinner, PageSkeleton } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";

const levels = [
  { name: "Easy", detail: "Foundational questions after CV analysis." },
  { name: "Medium", detail: "Role-fit practice based on your CV." },
  { name: "Hard", detail: "Advanced follow-ups from project evidence." },
];

export default function InterviewPrep() {
  const ready = useDelayedContent(520);
  const { cvFile } = useWorkspace();
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function startInterview() { setError(null); setLoading(true); window.setTimeout(() => { setLoading(false); setError(cvFile ? "Interview question generation is ready for the backend Agentic AI service. No questions are fabricated in the frontend." : "Upload and analyze a CV before starting personalized interview prep."); }, 700); }

  if (!ready) return <PageSkeleton />;

  return (
    <div><PageHeader title="Interview Prep" subtitle="Choose a difficulty, then generate questions from an uploaded CV and target role." /><Panel className="p-5"><div className="grid gap-4 md:grid-cols-3">{levels.map((level) => <button key={level.name} onClick={() => setDifficulty(level.name)} className={`tap-feedback rounded-lg border p-6 text-center transition ${difficulty === level.name ? "border-blueInk bg-blueSoft text-blueInk shadow-sketch" : "border-borderSoft bg-white hover:border-blue-200"}`}><div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-current">{difficulty === level.name ? <PlayCircle className="h-5 w-5" /> : <span className="h-3 w-3 rounded-full border border-current" />}</div><h2 className="hand-title text-xl font-semibold">{level.name}</h2><p className="mt-2 text-sm text-mutedInk">{level.detail}</p></button>)}</div><div className="mt-6 flex justify-center"><button onClick={startInterview} disabled={loading} className="tap-feedback inline-flex items-center gap-2 rounded-md bg-blueInk px-6 py-3 text-sm font-semibold text-white">{loading ? "Preparing" : "Start Interview"} <PlayCircle className="h-4 w-4" /></button></div></Panel><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]"><Panel className="p-5">{loading ? <NotebookSpinner label="Checking CV and interview service..." /> : error ? <ErrorState title="Questions not available yet" message={error} onRetry={startInterview} /> : <EmptyState title="No interview history" message="Start after uploading a CV. Questions will appear from the connected AI service, not from static examples." />}</Panel><div className="flex items-center justify-center"><Mic className="h-28 w-28 rotate-[-12deg] text-blueInk" /></div></div></div>
  );
}
