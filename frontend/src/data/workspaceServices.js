export function fileToRecord(file, category = "document") {
  const extension = file.name.includes(".") ? file.name.split(".").pop().toUpperCase() : "FILE";
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${category}`,
    name: file.name,
    type: extension,
    size: file.size,
    category,
    status: "Imported",
    created: null,
    modified: file.lastModified ? new Date(file.lastModified).toLocaleString() : "Unavailable",
    path: file.webkitRelativePath || "Browser upload session",
    versions: 1,
    duplicateOf: null,
  };
}

export function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function enrichFileRecords(records) {
  const seen = new Map();
  return records.map((record) => {
    const duplicateKey = `${record.name.toLowerCase()}-${record.size}`;
    const baseName = record.name.replace(/\.[^.]+$/, "").replace(/[_\- ]?(v|version)?\d+$/i, "").toLowerCase();
    const sameBase = records.filter((item) => item.name.replace(/\.[^.]+$/, "").replace(/[_\- ]?(v|version)?\d+$/i, "").toLowerCase() === baseName);
    const duplicateOf = seen.get(duplicateKey) || null;
    seen.set(duplicateKey, record.name);
    return {
      ...record,
      duplicateOf,
      versions: sameBase.length,
      status: duplicateOf ? "Duplicate" : sameBase.length > 1 ? "Versioned" : "Imported",
    };
  });
}

export function createPendingResponse(message, files) {
  const lower = message.toLowerCase();
  if (lower.includes("duplicate")) {
    const duplicates = files.filter((file) => file.duplicateOf);
    return duplicates.length
      ? `I found ${duplicates.length} duplicate candidate(s) in this browser session. Open Documents to inspect the file records and locations available from upload metadata.`
      : "I do not see duplicate candidates among the files imported in this browser session yet.";
  }
  if (lower.includes("latest") || lower.includes("newest")) {
    const latest = [...files].sort((a, b) => new Date(b.modified) - new Date(a.modified))[0];
    return latest ? `The newest imported file I can see is ${latest.name}. Its modified time is ${latest.modified}.` : "No files have been imported in this session yet. Upload files first so I can inspect real metadata.";
  }
  if (lower.includes("where") || lower.includes("find")) {
    return files.length ? "I can search the files imported in this browser session. Full-device search needs the backend file index to be connected." : "Upload or import files first. Device-wide file search is ready for backend integration but not connected in this frontend-only build.";
  }
  return "I can prepare this request for the Agentic AI backend. This frontend is keeping the conversation state ready without inventing analysis results.";
}

export async function requestCvAnalysis() {
  await new Promise((resolve) => window.setTimeout(resolve, 700));
  throw new Error("CV intelligence service is not connected yet. Upload state is captured and ready to send to the backend API.");
}
