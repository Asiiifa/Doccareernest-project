import CheckCircle from "lucide-react/dist/esm/icons/check-circle.js";
import CircleAlert from "lucide-react/dist/esm/icons/circle-alert.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";

const strengths = ["Strong technical skills in Python, FastAPI, SQL", "Good project experience", "Well-structured resume"];
const improvements = ["Add more quantified achievements", "Include relevant certifications", "Improve formatting in projects section"];
const topSkills = ["Python", "FastAPI", "SQL", "MongoDB", "Docker", "Git", "REST API"];
const missing = ["AWS", "CI/CD", "Kubernetes", "System Design"];

export default function ResumeAnalyzer() {
  return (
    <div>
      <PageHeader title="Resume Analysis Report" subtitle="AI-generated score, strengths, missing skills, and improvement suggestions." />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel className="p-5">
          <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-blueInk bg-white">
              <span className="text-4xl font-semibold text-blueInk">85</span>
              <span className="text-sm text-mutedInk">/100</span>
            </div>
            <div>
              <h2 className="hand-title mb-4 text-lg font-semibold">Score Breakdown</h2>
              {["Skills", "Experience", "Projects", "Education", "Overall"].map((label, index) => (
                <div key={label} className="mb-3 grid grid-cols-[90px_1fr_36px] items-center gap-3 text-sm">
                  <span>{label}</span>
                  <div className="h-2 rounded-full bg-blue-100"><div className="h-2 rounded-full bg-blueInk" style={{ width: `${90 - index * 4}%` }} /></div>
                  <span>{90 - index * 4}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <h2 className="hand-title mb-3 text-lg font-semibold">Strength Areas</h2>
            {strengths.map((item) => (
              <p key={item} className="mb-3 flex gap-2 text-sm"><CheckCircle className="h-4 w-4 shrink-0 text-success" />{item}</p>
            ))}
          </div>
          <div>
            <h2 className="hand-title mb-3 text-lg font-semibold">Improvement Suggestions</h2>
            {improvements.map((item) => (
              <p key={item} className="mb-3 flex gap-2 text-sm"><CircleAlert className="h-4 w-4 shrink-0 text-warning" />{item}</p>
            ))}
          </div>
        </Panel>
      </div>
      <Panel className="mt-5 grid gap-5 p-5 md:grid-cols-2">
        <div>
          <h2 className="hand-title mb-3 text-lg font-semibold">Skills Detected</h2>
          <div className="flex flex-wrap gap-2">{topSkills.map((skill) => <span key={skill} className="rounded-md border border-blue-200 bg-blueSoft px-3 py-1 text-sm text-blueInk">{skill}</span>)}</div>
        </div>
        <div>
          <h2 className="hand-title mb-3 text-lg font-semibold">Missing Skills</h2>
          <div className="flex flex-wrap gap-2">{missing.map((skill) => <span key={skill} className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm text-danger">{skill}</span>)}</div>
        </div>
      </Panel>
    </div>
  );
}
