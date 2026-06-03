import { statusStyles } from "../data/mockData.js";

export default function StatusTag({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${statusStyles[status] || "border-borderSoft bg-white text-mutedInk"}`}>
      {status}
    </span>
  );
}
