import PageHeader from "../components/PageHeader.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { skills } from "../data/mockData.js";

export default function Graphs() {
  return (
    <div>
      <PageHeader
        title="Graphs / Analytics"
        subtitle="Visual learning analytics generated from your resume and notes."
        action={<select className="rounded-md border border-borderSoft bg-white px-3 py-2 text-sm"><option>Bar Chart</option><option>Line Chart</option></select>}
      />
      <Panel className="p-5">
        <h2 className="hand-title mb-4 text-lg font-semibold">Skill Distribution Chart</h2>
        <div className="grid h-[360px] grid-cols-[42px_1fr] gap-3">
          <div className="flex flex-col justify-between pb-9 pt-2 text-xs text-mutedInk">
            <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
          </div>
          <div className="relative flex items-end justify-between gap-3 border-b border-l border-borderSoft bg-white/55 px-4 pt-4">
            <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-paperLine" />
            <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-paperLine" />
            <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-paperLine" />
            {skills.map((skill) => (
              <div key={skill.name} className="z-10 flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-ink">{skill.value}</span>
                <div className="w-full max-w-12 rounded-t-md bg-blueInk" style={{ height: `${skill.value}%` }} />
                <span className="h-8 text-center text-xs text-mutedInk">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Skills Found" value="14" detail="Across CV and notes" />
        <MetricCard label="Strong Skills" value="6" detail="Above benchmark" />
        <MetricCard label="Average Score" value="72%" detail="Learning analytics" />
        <MetricCard label="Skills to Improve" value="3" detail="Recommended focus" />
      </div>
    </div>
  );
}
