import { useRef, useState } from "react";
import Upload from "lucide-react/dist/esm/icons/upload.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import { EmptyState, ErrorState, NotebookSpinner, PageSkeleton, ProgressBar } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { requestCvAnalysis } from "../data/workspaceServices.js";

export default function ResumeAnalyzer() {
  const ready = useDelayedContent(560);
  const { cvFile, importCv, analysis, setAnalysis, addActivity } = useWorkspace();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function handleUpload(event) { if (!event.target.files?.length) return; setError(null); setProcessing(true); setProgress(15); [40, 72, 100].forEach((value, index) => window.setTimeout(() => setProgress(value), 220 * (index + 1))); window.setTimeout(() => { const record = importCv(event.target.files); addActivity(`${record?.name || "CV"} ready for analysis`); setProcessing(false); setProgress(0); event.target.value = ""; }, 900); }
  async function runAnalysis() { if (!cvFile) { inputRef.current?.click(); return; } setError(null); setProcessing(true); setProgress(30); try { await requestCvAnalysis(cvFile); setAnalysis(null); } catch (err) { setError(err.message); } finally { setProcessing(false); setProgress(0); } }

  if (!ready) return <PageSkeleton />;

  return (
    <div>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
      <PageHeader title="Resume Analysis" subtitle="Upload a CV first. Scores and recommendations appear only from the connected CV intelligence service." action={<button onClick={() => inputRef.current?.click()} className="tap-feedback inline-flex items-center gap-2 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white"><Upload className="h-4 w-4" />Upload CV</button>} />
      {processing && <div className="mb-5"><ProgressBar value={progress || 55} label={progress ? "CV upload" : "Analysis request"} /></div>}
      {error && <div className="mb-5"><ErrorState title="Analysis service not connected" message={error} onRetry={runAnalysis} /></div>}
      {!cvFile ? <Panel className="p-5"><EmptyState title="No CV analyzed yet" message="Upload a CV to prepare the analysis request. The frontend will show real backend scores once the API is connected." action={<button onClick={() => inputRef.current?.click()} className="mt-4 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Upload CV</button>} /></Panel> : <div className="grid gap-5 xl:grid-cols-[1fr_1fr]"><Panel className="p-5"><h2 className="hand-title text-xl font-semibold">Uploaded CV</h2><div className="mt-4 rounded-lg border border-borderSoft bg-white p-4 text-sm"><p className="font-semibold">{cvFile.name}</p><p className="mt-1 text-mutedInk">Modified {cvFile.modified}</p><p className="mt-1 text-mutedInk">Location: {cvFile.path}</p></div><button onClick={runAnalysis} disabled={processing} className="tap-feedback mt-5 rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Run Analysis</button>{processing && <div className="mt-4"><NotebookSpinner label="Contacting analysis service..." /></div>}</Panel><Panel className="p-5">{analysis ? <div>{JSON.stringify(analysis)}</div> : <EmptyState title="Analysis results pending" message="No score, strengths, or missing skills are shown until the CV intelligence backend returns them." />}</Panel></div>}
    </div>
  );
}
