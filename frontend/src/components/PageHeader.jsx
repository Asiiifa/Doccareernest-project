export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="hand-title text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mutedInk">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
