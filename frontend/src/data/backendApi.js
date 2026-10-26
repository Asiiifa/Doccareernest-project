const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.detail || `Backend request failed (${response.status}).`);
  return body;
}

export function getApprovedRoots() {
  return request("/files/approved-roots");
}

export function approveRoot(directoryPath) {
  return request("/files/approved-roots", { method: "POST", body: JSON.stringify({ directory_path: directoryPath }) });
}

export function removeRoot(rootId) {
  return request(`/files/approved-roots/${encodeURIComponent(rootId)}`, { method: "DELETE" });
}

export function scanRoot(directoryPath, replaceExisting = true) {
  return request("/files/scan", { method: "POST", body: JSON.stringify({ directory_path: directoryPath, compute_hashes: true, replace_existing_for_root: replaceExisting }) });
}

export function getStorageStats() {
  return request("/files/stats");
}

export function searchIndexedFiles() {
  return request("/files/search", { method: "POST", body: JSON.stringify({ limit: 500 }) });
}

export function findDuplicates() {
  return request("/files/duplicates", { method: "POST", body: JSON.stringify({ min_group_size: 2 }) });
}
