import Filter from "lucide-react/dist/esm/icons/filter.js";
import Folder from "lucide-react/dist/esm/icons/folder.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import PageHeader from "../components/PageHeader.jsx";
import Panel from "../components/Panel.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import StatusTag from "../components/StatusTag.jsx";
import { documents, folders } from "../data/mockData.js";

export default function Documents() {
  return (
    <div>
      <PageHeader title="Documents" subtitle="Organize resumes, notes, PDFs, and AI-generated study material." />
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="flex items-center gap-2 rounded-md border border-borderSoft bg-white px-3 py-2">
          <Search className="h-4 w-4 text-mutedInk" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Search documents..." />
        </label>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-borderSoft bg-white px-4 py-2 text-sm"><Filter className="h-4 w-4" />Filters</button>
        <select className="rounded-md border border-borderSoft bg-white px-4 py-2 text-sm outline-none">
          <option>All AI Status</option>
          <option>Latest Version</option>
          <option>Outdated</option>
        </select>
      </div>
      <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
        <Panel className="p-4">
          <SectionTitle>Folders</SectionTitle>
          <div className="mt-4 space-y-3">
            {folders.map((folder) => (
              <div key={folder.name} className="rounded-lg border border-borderSoft bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-blueInk" />
                  <div>
                    <p className="font-semibold">{folder.name}</p>
                    <p className="text-xs text-mutedInk">{folder.count} files • Updated {folder.updated}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="overflow-hidden">
          <div className="border-b border-borderSoft px-4 py-3">
            <SectionTitle>Document List</SectionTitle>
          </div>
          <div className="grid gap-3 p-4">
            {documents.map((doc) => (
              <div key={doc.name} className="grid gap-3 rounded-lg border border-borderSoft bg-white/80 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-mutedInk">{doc.folder} • {doc.type} • Modified {doc.modified}</p>
                </div>
                <StatusTag status={doc.status} />
                <span className="rounded-md border border-borderSoft px-3 py-1 text-xs text-mutedInk">v{doc.versions}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
