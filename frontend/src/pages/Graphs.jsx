import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { EmptyState, ErrorState, NotebookSpinner, PageSkeleton, ProgressBar } from "../components/Feedback.jsx";
import useDelayedContent from "../hooks/useDelayedContent.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";

export default function Graphs() {
  const ready = useDelayedContent(540);
  const { analysis } = useWorkspace();
  const [chart, setChart] = useState("Bar Chart");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const data = analysis?.skills || [];

  function generate() { setError(null); setGenerating(true); window.setTimeout(() => { setGenerating(false); if (!analysis) setError("No analytics source is available yet. Upload and analyze a CV before generating charts."); }, 650); }

  if (!ready) return <PageSkeleton />;

  return (
    <div><PageHeader title="Graphs / Analytics" subtitle="Charts appear only after real CV analysis data is available." action={<div className="flex gap-2"><select value={chart} onChange={(event) => setChart(event.target.value)} className="rounded-md border border-borderSoft bg-white px-3 py-2 text-sm"><option>Bar Chart</option><option>Line Chart</option></select><button onClick={generate} className="rounded-md bg-blueInk px-4 py-2 text-sm font-semibold text-white">Generate</button></div>} />{generating && <div className="mb-5"><ProgressBar value={70} label="Graph generation" /></div>}{error && <div className="mb-5"><ErrorState title="No graph data" message={error} onRetry={generate} /></div>}<Panel className="p-5"><h2 className="hand-title mb-4 text-lg font-semibold">Skill Distribution Chart</h2><div className="h-[360px]">{data.length === 0 ? <EmptyState title="No graphs available" message="Connect CV analysis output to render real skill and learning analytics here." /> : <ResponsiveContainer width="100%" height="100%">{chart === "Bar Chart" ? <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e1e6f3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#2f67e8" radius={[6, 6, 0, 0]} /></BarChart> : <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e1e6f3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="value" stroke="#2f67e8" strokeWidth={3} /></LineChart>}</ResponsiveContainer>}</div></Panel><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total Skills Found" value={analysis ? analysis.totalSkills : "--"} detail="From CV analysis" /><MetricCard label="Strong Skills" value={analysis ? analysis.strongSkills : "--"} detail="Backend response" /><MetricCard label="Average Score" value={analysis ? `${analysis.averageScore}%` : "--"} detail="Backend response" /><MetricCard label="Skills to Improve" value={analysis ? analysis.skillsToImprove : "--"} detail="Backend response" /></div>{generating && <div className="mt-4"><NotebookSpinner label="Preparing chart area..." /></div>}</div>
  );
}
