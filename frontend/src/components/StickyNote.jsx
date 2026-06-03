import Pin from "lucide-react/dist/esm/icons/pin.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import Star from "lucide-react/dist/esm/icons/star.js";

export default function StickyNote({ title = "Quick Note", children, smile = false }) {
  return (
    <div className="relative rounded-sm border border-stickyDark bg-sticky p-4 shadow-sticky">
      <Pin className="absolute right-3 top-2 h-4 w-4 text-blueInk" />
      <h3 className="hand-title mb-3 text-base font-semibold">{title}</h3>
      <div className="hand-title text-sm leading-6 text-ink">{children}</div>
      {smile ? (
        <div className="mt-4 h-5 w-12 rounded-b-full border-b-2 border-r-2 border-ink" />
      ) : (
        <Star className="ml-auto mt-3 h-6 w-6 text-ink" />
      )}
      <Sparkles className="absolute bottom-3 right-3 h-4 w-4 text-blueInk" />
    </div>
  );
}
