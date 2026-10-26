import AlertCircle from "lucide-react/dist/esm/icons/alert-circle.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.js";

export function NotebookSpinner({ label = "Working..." }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-blueInk">
      <span className="notebook-spinner" />
      {label}
    </span>
  );
}

export function ProgressBar({ value = 0, label = "Progress" }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-mutedInk">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full rounded-full bg-blueInk transition-all duration-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message = "Start by adding your first item.", action, icon: Icon = FileText }) {
  return (
    <div className="notebook-paper flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-blue-200 p-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-blue-200 bg-white text-blueInk shadow-sketch">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="hand-title text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-mutedInk">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title = "Something needs another try", message = "The page stayed safe, but this action did not finish.", onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/70 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-danger" />
        <div>
          <h3 className="hand-title text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-mutedInk">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-danger">
              <RefreshCw className="h-4 w-4" />Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ variant = "dashboard" }) {
  const cards = variant === "chat" ? 3 : 6;
  return (
    <div className="space-y-5">
      <div className="skeleton-line h-9 w-72 max-w-full rounded-md" />
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="doodle-border notebook-paper rounded-lg p-5">
          <div className="skeleton-line mb-5 h-6 w-44 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: cards }).map((_, index) => (
              <div key={index} className="grid gap-3 rounded-md border border-borderSoft bg-white/60 p-4 sm:grid-cols-[1fr_120px_120px]">
                <div className="skeleton-line h-4 rounded" />
                <div className="skeleton-line h-4 rounded" />
                <div className="skeleton-line h-4 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton-card h-44 rounded-lg" />
          <div className="skeleton-card h-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
