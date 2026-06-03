export default function MetricCard({ label, value, detail }) {
  return (
    <div className="doodle-border rounded-lg bg-white/80 p-4">
      <p className="text-xs text-mutedInk">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-blueInk">{value}</p>
      {detail && <p className="mt-1 text-xs text-mutedInk">{detail}</p>}
    </div>
  );
}
