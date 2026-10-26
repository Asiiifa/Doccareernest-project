# DocCareerNest AI — Backend

Production-oriented FastAPI backend for **File Intelligence** and future **CV Intelligence**.

This milestone implements real filesystem scanning, metadata extraction, SHA-256 hashing, SQLite indexing, deterministic duplicate detection, and API boundaries for future **Agentic AI** and **n8n** integration.

## Stack

- Python 3.12+
- FastAPI + Uvicorn
- pydantic-settings
- SQLite (local development index)

## Project structure

```text
backend/
  app/
    main.py                 # FastAPI app, CORS, logging, error handling
    api/                    # HTTP routes
    core/config.py          # Environment configuration
    schemas/                # Pydantic request/response models
    services/               # Deterministic file intelligence services
    agents/file_agent.py    # Tool interfaces for future LLM agent
    db/                     # SQLite file index
  tests/
  requirements.txt
  .env.example
```

## Setup

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

## Run the API

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

OpenAPI docs: http://127.0.0.1:8000/docs

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| POST | `/api/files/approved-roots` | Persist a user-approved scan directory |
| GET | `/api/files/approved-roots` | List approved scan directories |
| DELETE | `/api/files/approved-roots/{id}` | Remove an approved folder and its uncovered indexed files |
| POST | `/api/files/scan` | Scan an approved directory (or a subdirectory of one) |
| POST | `/api/files/search` | Search indexed files under approved roots |
| GET | `/api/files/latest` | Return the newest matching indexed file |
| GET | `/api/files/stats` | Accurate indexed-file and duplicate totals |
| POST | `/api/files/duplicates` | Find exact SHA-256 duplicate groups |
| GET | `/api/files/{id}` | Get one indexed file by ID |

### Example: scan a directory

```json
POST /api/files/scan
{
  "directory_path": "D:\\Documents\\Resumes",
  "compute_hashes": true,
  "replace_existing_for_root": true
}
```

### Example: search files

```json
POST /api/files/search
{
  "query": "resume",
  "extension": ".pdf",
  "limit": 20
}
```

Scan and search only run after the directory is approved:

```json
POST /api/files/approved-roots
{
  "directory_path": "D:\\Documents\\Resumes"
}
```

## Safety rules

- The scanner only runs on directories **explicitly approved** by the client.
- Scan, search, latest, duplicates, and get-by-id are limited to those approved roots.
- System directories (for example `C:\Windows`) are blocked.
- Inaccessible files are skipped; the scan continues.
- No destructive filesystem operations are exposed.
- Internal exceptions are not returned directly to clients.

## Agentic AI (planned next milestone)

`app/agents/file_agent.py` defines tool-oriented interfaces only:

- `search_files`
- `get_file_metadata`
- `find_duplicates`
- `find_latest_version`

A future LLM agent will interpret natural-language requests, choose tools, and explain results. Deterministic logic remains in services — not in the LLM.

## Planned n8n workflows (not connected yet)

These workflows will call the backend APIs above:

1. **Directory watch / scheduled indexing**
   - Trigger: folder change or cron
   - Action: `POST /api/files/scan`

2. **New file processing**
   - Trigger: scan completion webhook
   - Action: enqueue metadata sync and optional CV processing

3. **Duplicate review**
   - Trigger: manual or scheduled
   - Action: `POST /api/files/duplicates`
   - Action: notify user with duplicate locations

4. **CV processing pipeline** (future)
   - Trigger: new document detected
   - Action: call future CV endpoints and generate notes/interview material

5. **AI-assisted file queries** (future)
   - Trigger: user request from frontend
   - Action: invoke agent orchestration using backend tools

n8n is **not** embedded in Python. The backend exposes stable HTTP APIs for n8n to orchestrate.

## Tests

```powershell
pytest -q
```

## What is intentionally not included yet

- Authentication / Supabase
- Cloud storage
- Vector search
- LLM / agent runtime
- Near-duplicate similarity
- Live n8n workflow connections
- Frontend integration wiring

Those will be added in later milestones.
