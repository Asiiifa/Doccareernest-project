# DocCareerNest AI Frontend Technical Documentation

## 1. Scope and Current Status

This document describes the frontend that currently exists in `frontend/`. It is based on the implementation, imports, configuration, and route wiring in the repository.

The frontend is a React/Vite single-page application for organizing career documents and preparing CV-related workflows. It currently combines:

- Browser-local workspace state for uploaded files, CV selection, notes, activity, analysis placeholders, mind-map nodes, and preferences.
- A verified FastAPI file-index API boundary for approved folders, scanning, indexed-file search, and duplicate detection.
- UI-only or pending states for authentication, profile persistence, notification delivery, password/security services, Agentic AI, n8n, and other unavailable backend capabilities.

The application does not currently implement authentication, account APIs, notification delivery, password APIs, device biometric APIs, Agentic AI streaming, or n8n workflow integration.

The active Settings route imports `src/pages/SettingsComplete.jsx`. `SettingsPhaseOne.jsx` and `Settings.jsx` remain in the source tree as earlier Settings implementations; they are not selected by the active route. `Settings.jsx` re-exports the Phase One implementation rather than being the active page.

## 2. Project Structure

```text
frontend/
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── dist/                         # generated Vite build output
├── node_modules/                 # installed dependencies
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── assets/
    │   └── doccareernest-logo.png
    ├── components/
    ├── data/
    ├── hooks/
    ├── layouts/
    ├── pages/
    └── styles/
```

There is one frontend application/package. No second frontend package was found under the frontend directory.

## 3. Technology Stack

### Runtime and build tools

| Technology | Declared version | Installed version | Usage |
|---|---:|---:|---|
| React | `^19.0.0` | `19.2.7` | Component rendering and local state. |
| React DOM | `^19.0.0` | `19.2.7` | Browser root mounting in `src/main.jsx`. |
| JavaScript/JSX | ESM | ESM/JSX | No TypeScript files are present. `package.json` sets `type: module`. |
| Vite | `^6.0.7` | `6.4.3` | Dev server and production bundling. |
| `@vitejs/plugin-react` | `^4.3.4` | `4.7.0` | React transform/plugin used by Vite. |

### UI, styling, routing, and icons

| Technology | Declared version | Installed version | Usage |
|---|---:|---:|---|
| Tailwind CSS | `^3.4.17` | `3.4.19` | Utility classes throughout JSX. Configured in `tailwind.config.js`. |
| PostCSS | `^8.4.49` | `8.5.15` | Runs Tailwind and Autoprefixer. |
| Autoprefixer | `^10.4.20` | `10.5.0` | PostCSS browser-prefix processing. |
| React Router DOM | `^7.1.1` | `7.16.0` | `BrowserRouter`, `Routes`, `Route`, `Navigate`, `NavLink`, and `Link`. |
| Lucide React | `^0.468.0` | `0.468.0` | Icons imported directly from `lucide-react/dist/esm/icons/*.js`. |

The project does not use a separate component library, CSS-in-JS system, animation library, form library, Axios, Redux, Zustand, React Query, or a schema-validation library.

### Charts

| Technology | Declared version | Installed version | Usage |
|---|---:|---:|---|
| Recharts | `^2.15.0` | `2.15.4` | Bar and line charts in `src/pages/Graphs.jsx`. |

Recharts is actively used. The production bundle reports a chunk-size warning because the chart dependency contributes to a large JavaScript chunk.

### Testing, linting, and formatting

No frontend test framework, ESLint configuration, Prettier configuration, or frontend test script is present. The package exposes only `dev`, `build`, and `preview` scripts. Backend tests exist separately under `backend/tests` and are not frontend tests.

## 4. NPM Scripts and Build Configuration

From `frontend/package.json`:

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "vite build",
  "preview": "vite preview --host 127.0.0.1"
}
```

### Vite

`vite.config.js`:

- Enables `@vitejs/plugin-react`.
- Configures `server.sourcemapIgnoreList` to ignore source-map warnings from `lucide-react`.
- Excludes `lucide-react` from Vite dependency optimization.

### Tailwind

`tailwind.config.js` scans `index.html` and `src/**/*.{js,jsx}`. It extends the theme with:

- Notebook colors: `paper`, `paperLine`, `ink`, `mutedInk`, `blueInk`, `blueSoft`.
- Sticky-note colors: `sticky`, `stickyDark`.
- Status colors: `success`, `warning`, `danger`.
- Sketch and sticky-note shadows.
- `handwritten` and `sans` font-family aliases.

`postcss.config.js` runs Tailwind and Autoprefixer.

`index.html` defines the document title `DocCareerNest AI`, viewport metadata, and loads `/src/main.jsx` as the module entry point.

## 5. Application Initialization and Routing

### Entry point

`src/main.jsx`:

1. Imports React, `createRoot`, and `BrowserRouter`.
2. Imports `App` and the global stylesheet.
3. Mounts the application into `#root`.
4. Wraps the tree in `React.StrictMode` and `BrowserRouter`.

### App initialization

`src/App.jsx`:

- Adds a short startup sequence using `stage` state:
  - `skeleton` initially.
  - `splash` after 550 ms.
  - `app` after 2.4 seconds.
- Renders `SplashScreen` until the application stage.
- Wraps active routes with `WorkspaceProvider`.
- Uses `AppLayout` as the route layout.
- Uses `DefaultLanding` for the index route. It reads persisted workspace preferences and redirects to `/documents` for File Explorer or `/resume-analyzer` for CV Intelligence.

### Active routes

| Path | Active component | Purpose |
|---|---|---|
| `/` | `DefaultLanding` | Redirects according to the persisted landing-page preference. |
| `/dashboard` | `Dashboard` | Browser-session workspace overview and file import. |
| `/documents` | `Documents` | File explorer for imported browser files. |
| `/cv-to-notes` | `CvToNotes` | CV/notes chat workspace and upload controls. |
| `/resume-analyzer` | `ResumeAnalyzer` | CV upload and backend-ready analysis state. |
| `/assistant` | `AiAssistant` | Metadata-aware local chat surface. |
| `/interview-prep` | `InterviewPrep` | Difficulty selection and backend-ready interview start flow. |
| `/mind-maps` | `MindMaps` | Local blank-node mind-map canvas. |
| `/graphs` | `Graphs` | Recharts analytics surface waiting for analysis data. |
| `/settings` | `SettingsComplete` | Active five-tab settings page. |

There are no login, signup, onboarding, or authentication routes.

## 6. Layout and Navigation

### `src/layouts/AppLayout.jsx`

Provides the shared notebook shell:

- Outer responsive paper background.
- Desktop `Sidebar`.
- `TopBar`.
- Scrollable main area containing the route `Outlet`.
- Uses Tailwind classes plus the global notebook styling.

### `src/layouts/Sidebar.jsx`

Contains the desktop navigation links for Dashboard, Documents, CV to Notes, Resume Analyzer, AI Assistant, Interview Prep, Mind Maps, Graphs, and Settings. It uses `NavLink` active-state styling and Lucide icons.

The sidebar also contains a Workspace Status card. Its Connect Services button is presentational and does not currently connect a service.

### `src/layouts/TopBar.jsx`

Provides:

- Search input with a short local spinner while typing.
- Light/dark toggle driven by `WorkspaceProvider` preferences.
- Help popover linking to Documents.
- Notifications popover showing the current no-notification state.
- Local profile menu linking to Settings.
- Responsive mobile navigation menu.
- Escape and outside-click handling for top-bar menus.

The top-bar theme toggle sets explicit `light` or `dark` preferences. System theme behavior is applied by the workspace provider.

## 7. Global State and Persistence

### `src/hooks/useWorkspace.jsx`

`WorkspaceProvider` is the only application-wide React context. It stores:

- `rawFiles`: browser-selected file records.
- `cvFile`: the selected CV record.
- `notes`: locally queued/generated-note request records.
- `activity`: local workspace activity entries.
- `analysis`: analysis result placeholder.
- `mindMapNodes`: local mind-map node state.
- `preferences`: persisted local settings.

Derived `files` are generated with `useMemo` by calling `enrichFileRecords`.

Provided functions include:

- `importFiles(fileList, category)`: converts browser `File` objects to records and prepends them to state.
- `importCv(fileList)`: imports a CV, sets `cvFile`, clears prior analysis, and clears notes.
- `addActivity(text)`: adds a timestamped local activity entry.
- State setters for notes, analysis, and mind-map nodes.
- `setPreferences` for local settings updates.

### Local preference persistence

Preferences are stored under the browser `localStorage` key `doccareernest-preferences`.

Current defaults:

```text
theme: system
landingPage: documents
fileView: list
language: system
dateFormat: system
confirmDelete: true
notificationsEnabled: true
notifications: indexingCompleted, cvProcessingCompleted,
               duplicatesDetected, workflowFailed, learningReminders
```

The provider merges stored preferences with defaults and safely falls back to defaults if JSON parsing fails.

The provider also toggles the `dark-theme` class on `document.body` based on explicit theme choice or `prefers-color-scheme` when the choice is `system`.

### Browser-local behavior

Workspace file state, CV state, activity, notes, analysis, and mind-map nodes are React state only. They are not persisted across a full reload. Preferences are the main persisted frontend state.

## 8. Data and API Boundaries

### `src/data/workspaceServices.js`

Contains browser-local service helpers:

- `fileToRecord(file, category)`: creates a metadata record from a browser `File`.
- `formatBytes(bytes)`: formats byte counts into B/KB/MB/GB.
- `enrichFileRecords(records)`: detects same-name/size duplicates and filename-version groups, assigning `duplicateOf`, `versions`, and local status values.
- `createPendingResponse(message, files)`: returns local metadata-aware assistant responses for duplicate, latest/newest, and where/find prompts. Otherwise it returns a backend-pending response.
- `requestCvAnalysis()`: waits briefly and deliberately throws a backend-not-connected error. It does not fabricate analysis.

### `src/data/backendApi.js`

Uses the browser Fetch API. The base URL is:

```text
VITE_API_BASE_URL, if defined
http://127.0.0.1:8000/api, otherwise
```

No secret or token is embedded in this code.

The generic request helper sends JSON, parses JSON responses, and throws an error using the backend `detail` field or HTTP status.

Implemented API methods:

| Frontend function | HTTP request | Purpose |
|---|---|---|
| `getApprovedRoots()` | `GET /files/approved-roots` | Lists approved scan folders. |
| `approveRoot(path)` | `POST /files/approved-roots` | Requests approval for a directory path. |
| `scanRoot(path, replaceExisting)` | `POST /files/scan` | Scans an approved directory. |
| `searchIndexedFiles()` | `POST /files/search` | Requests up to 500 indexed file records. |
| `findDuplicates()` | `POST /files/duplicates` | Requests exact duplicate groups. |

The frontend does not call authentication, profile, password, sessions, notification, n8n, or Agentic AI endpoints because none are defined in the current frontend API client.

## 9. Shared Components

### `src/components/Feedback.jsx`

Exports:

- `NotebookSpinner`: custom rotating notebook-style spinner.
- `ProgressBar`: percentage progress display with blue ink fill.
- `EmptyState`: notebook-paper empty state with icon, title, message, and optional action.
- `ErrorState`: error message with optional Retry action.
- `PageSkeleton`: reusable loading skeleton with dashboard/chat variants.

### `Panel.jsx`

Wraps content in the shared rounded notebook panel with `doodle-border` and paper background.

### `PageHeader.jsx`

Renders a page title, optional subtitle, and optional action area.

### `SectionTitle.jsx`

Renders the smaller section heading used inside panels.

### `MetricCard.jsx`

Renders a label, value, and optional detail inside a bordered metric card. It is used by Graphs.

### `StatusTag.jsx`

Maps status names to styles from `src/data/mockData.js`. Current status style keys include `Latest Version`, `Updated Today`, `Outdated`, and `Archive Recommended`; browser-imported file records normally use `Imported`, `Duplicate`, or `Versioned`, which fall back to the generic style when not explicitly mapped.

### `Logo.jsx`

Loads `src/assets/doccareernest-logo.png` and renders the brand image plus handwritten DocCareerNest AI text. Supports a compact mobile form.

### `SplashScreen.jsx`

Renders the startup skeleton or splash state with the official logo and notebook styling.

### `StickyNote.jsx`

Reusable local sticky-note component used on Dashboard, CV to Notes, and AI Assistant. It supports:

- Edit mode with textarea.
- Save and cancel.
- Erase content.
- Pin/unpin.
- Add emoji.
- Favorite/star toggle.
- Add nested sticky notes.
- Delete with local restore.
- Outside-click closing for its options menu.

Sticky-note state is local React state and is not persisted to a backend.

## 10. Page-by-Page Documentation

### Dashboard — `src/pages/Dashboard.jsx`

**Route:** `/dashboard`

Purpose: gives a browser-session overview of imported documents and local file intelligence.

Implementation:

- Uses `useDelayedContent(550)` and `PageSkeleton`.
- Reads `files`, `activity`, and `importFiles` from `useWorkspace`.
- Uses a hidden multiple-file input for browser uploads.
- Shows import progress through `ProgressBar` and `NotebookSpinner`.
- Provides filename search using `useMemo`.
- Displays a Recent Documents table with name, extension/type, local status, modified time, formatted size, and an info action.
- Shows empty states when no files are imported or a query has no matches.
- Displays local duplicate candidate and version-group counts.
- Displays activity entries from the current browser session.
- Uses `StickyNote` for the dashboard tip.

The Dashboard does not perform device-wide scanning. It only sees browser-selected files in the current React session.

### Documents / File Explorer — `src/pages/Documents.jsx`

**Route:** `/documents`

Purpose: lists and filters browser-imported files and exposes the saved list/grid preference.

Implementation:

- Uses `useDelayedContent(520)`.
- Reads `files`, `importFiles`, and `preferences` from `useWorkspace`.
- Supports multiple-file import with a progress indicator.
- Derives folder/category filters from the imported records.
- Supports filename search, status filter, folder selection, and sorting by name or modified value.
- Displays either a list layout or a two-column grid based on `preferences.fileView`.
- Shows selected-file details including name, type, size, modified time, and path metadata.
- Uses `StatusTag`, `EmptyState`, `Panel`, and `ProgressBar`.

The Filters button is currently presentational; status/folder/sort controls are the functional filtering controls.

### CV to Notes — `src/pages/CvToNotes.jsx`

**Route:** `/cv-to-notes`

Purpose: provides a ChatGPT-style CV and notes workspace without inventing generated CV content.

Implementation:

- Uses `useDelayedContent(560)` and chat skeleton state.
- Supports Upload CV, Upload PDF, Upload Notes, and Upload Image options.
- Uses an attachment menu controlled by `menuOpen` with outside-click and Escape closing.
- Uses hidden file input `accept` values based on the selected attachment type.
- Tracks upload progress through staged local percentages.
- Imports selected files through `importCv` or `importFiles`.
- Shows chat messages for imported files and user requests.
- Requires a CV before queuing personalized note/interview requests.
- Adds local note records with status `Ready for backend generation`; it does not present fabricated AI content.
- Quick actions include summarize CV, extract skills, generate interview questions, and create revision sheet.
- Displays Generated Notes with title, source filename, and request status.
- Uses a reusable editable `StickyNote` in the side panel.

### Resume Analyzer — `src/pages/ResumeAnalyzer.jsx`

**Route:** `/resume-analyzer`

Purpose: captures a CV upload and prepares a backend analysis request.

Implementation:

- Starts with an empty `No CV analyzed yet` state.
- Uses a hidden CV file input and the workspace `importCv` method.
- Shows uploaded filename, modified metadata, and browser-session location metadata.
- Has a `Run Analysis` action.
- Calls `requestCvAnalysis`, which deliberately throws a clear service-not-connected error.
- Does not display fake score, skills, strengths, missing skills, or suggestions.
- Uses `ErrorState`, `NotebookSpinner`, and `EmptyState`.

### AI Assistant — `src/pages/AiAssistant.jsx`

**Route:** `/assistant`

Purpose: metadata-aware local assistant surface prepared for future backend/Agentic AI streaming.

Implementation:

- Starts empty and asks the user to import files first.
- Reads `files` and `cvFile` from workspace context.
- Maintains local message history and input state.
- Auto-scrolls to the latest message using a bottom ref.
- Uses `createPendingResponse` for duplicate, latest, and file-location questions.
- Shows a thinking spinner while preparing a response.
- Includes clickable suggested prompts.
- Includes paperclip and microphone controls, but they currently have no connected action.
- Uses `StickyNote` for the assistant tip.

### Interview Prep — `src/pages/InterviewPrep.jsx`

**Route:** `/interview-prep`

Purpose: selects interview difficulty and prepares an interview request.

Implementation:

- Offers Easy, Medium, and Hard difficulty options.
- Stores the selected difficulty locally in component state.
- Start Interview enters loading state.
- The current implementation does not generate questions locally; it reports that CV/interview backend services are unavailable.
- Uses `EmptyState`, `ErrorState`, `NotebookSpinner`, `Panel`, and a microphone icon illustration.

### Mind Maps — `src/pages/MindMaps.jsx`

**Route:** `/mind-maps`

Purpose: provides a notebook-style local canvas for a blank mind map.

Implementation:

- Reads and updates `mindMapNodes` from workspace context.
- Supports zoom decrease/increase within a bounded range.
- Supports node selection.
- Can create a blank node locally.
- Renders a central Map node, child nodes, and a connector line.
- Shows progress/spinner states for local map updates.
- Does not generate a CV-derived mind map without backend/AI output.

Some toolbar controls such as undo/share/download are presentational or limited to the current local behavior; there is no persistence or export service.

### Graphs / Analytics — `src/pages/Graphs.jsx`

**Route:** `/graphs`

Purpose: renders analytics when real analysis data exists.

Implementation:

- Uses Recharts `ResponsiveContainer`, `BarChart`, `LineChart`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Bar`, and `Line`.
- Supports Bar Chart and Line Chart selection.
- Reads analysis data from workspace context.
- Displays empty state when no analysis is available.
- Generate shows progress/error states but does not invent analytics.
- Metric cards show `--` until backend analysis data is available.

### Settings — `src/pages/SettingsComplete.jsx`

**Route:** `/settings`

Purpose: central settings surface with five tabs and a mixture of local preferences, real file-index actions, and clearly marked pending integrations.

Tabs:

1. Profile
2. Preferences
3. Notifications
4. Security
5. Storage

Profile:

- Empty display name/email fields because no authenticated account data exists.
- Local profile-picture preview through an object URL.
- Edit Profile flow with Pencil icon, Display Name, Email, validation, Save Changes, and Cancel.
- Save reports authentication/profile API pending; it does not claim remote success.
- Delete Account uses a confirmation dialog and explicitly performs no deletion.

Preferences:

- Light, Dark, System theme.
- Default landing page: File Explorer or CV Intelligence.
- Default file view: List or Grid.
- Language and date-format selectors.
- Confirm-before-deleting toggle.
- All are stored in the workspace local-preferences object.

Notifications:

- Master notifications toggle.
- File indexing completed.
- CV processing completed.
- Duplicate files detected.
- n8n workflow failed.
- Learning reminders.

These preferences persist locally but are labeled as pending because no notification service exists.

Security:

- Change password dialog with current/new/confirm fields, show/hide controls, minimum length and match validation, cancel, and backend-pending message.
- Two-factor authentication and biometric lock controls are disabled pending APIs/device support.
- View Active Sessions opens a no-data dialog explaining that authentication/session APIs are unavailable.
- Privacy Controls opens a dialog that distinguishes local delete-confirmation behavior from unavailable account privacy APIs.
- Delete account and data uses confirmation and never deletes data locally.

Storage:

- Loads approved roots, indexed-file totals, and duplicate totals from `backendApi.js`.
- Shows storage size only when the returned API records represent the complete indexed set; otherwise displays unavailable rather than estimating.
- Allows entering a path for the existing approve-root endpoint.
- Allows re-indexing an approved root through the existing scan endpoint.
- Refreshes backend data after successful operations.
- Remove approved folder is visible but reports that no remove-root API exists.
- Clear cache is visible but reports that no cache-management API exists.
- Manage stored documents links to `/documents`.

Storage API errors render `ErrorState` with Retry. Loading renders `NotebookSpinner`.

## 11. Styling and Visual System

`src/styles/index.css` contains the global visual system in addition to Tailwind utilities.

### Theme

- Light notebook background uses paper white, blue horizontal notebook lines, soft black ink, and blue ink accents.
- Dark mode applies the `dark-theme` body class and overrides paper, panel, border, text, skeleton, sticky-note, status, and hover colors.
- `notebook-paper` provides lined paper backgrounds.
- `doodle-border` provides soft borders and sketch-like shadow.
- `hand-title` uses `Segoe Print`, `Bradley Hand ITC`, or a cursive fallback.
- Body text uses Inter, Segoe UI, Arial, or sans-serif fallbacks.

### Interaction and loading styles

- `.tap-feedback` provides press transitions.
- `.ink-focus` provides blue focus ring styling.
- `.notebook-spinner` is a custom CSS spinner.
- `.skeleton-line` and `.skeleton-card` provide blue shimmer loaders.
- `.splash-ink` animates splash emphasis.
- Buttons have pointer cursors and disabled opacity/cursor behavior.

No external font file or font CDN is referenced. Handwritten typography depends on fonts available on the device.

## 12. Assets and Icons

The only application image asset found under `src/assets` is:

```text
src/assets/doccareernest-logo.png
```

The logo is loaded by `Logo.jsx` and `SplashScreen.jsx`.

All interface icons are Lucide React icons imported from direct ESM icon paths. There is no custom SVG icon directory, icon font, image-upload processing library, or document preview asset set.

## 13. Forms, Validation, and Browser APIs

The frontend uses native React-controlled inputs rather than a form library.

Observed browser APIs and platform features:

- `File` and hidden `<input type="file">` controls for browser uploads.
- `URL.createObjectURL` for local profile picture preview.
- `window.localStorage` for preferences.
- `window.matchMedia` for system theme preference.
- `crypto.randomUUID()` for local record/activity/message IDs.
- `window.setTimeout` for simulated perception/loading delays and local progress transitions.
- `document` event listeners for Escape, outside-click, and menu closing.

Validation is implemented inline in page handlers for email/password/path requirements. No shared schema validator is installed.

## 14. Error, Empty, and Loading Behavior

The application consistently uses:

- Skeletons before page content.
- Notebook spinners for active local/backend-bound work.
- Progress bars for browser upload/import progress and selected operations.
- Empty states for missing files, notes, analysis, graphs, maps, and interview history.
- Error states with retry for backend/file-service operations.
- Pending labels when a control is intentionally UI-only pending backend support.

Some visual controls remain presentational, including selected microphone/paperclip controls and parts of the Mind Maps toolbar. They do not claim successful backend operations.

## 15. Environment Variables and External Services

The only frontend environment variable reference found is:

```text
VITE_API_BASE_URL
```

It changes the base URL used by `backendApi.js`. The fallback is `http://127.0.0.1:8000/api`.

No API keys, tokens, passwords, secrets, Supabase credentials, OAuth configuration, or external AI service credentials are present in the frontend source.

The current external service boundary is the local FastAPI file-index API. The frontend also references future Agentic AI and n8n capabilities in UI copy, but does not call those services.

## 16. Backend Contract Relevant to the Frontend

The backend currently exposes the following file routes under `/api`:

- `GET /api/health`
- `POST /api/files/approved-roots`
- `GET /api/files/approved-roots`
- `POST /api/files/scan`
- `POST /api/files/search`
- `GET /api/files/latest`
- `POST /api/files/duplicates`
- `GET /api/files/{file_id}`

The frontend currently consumes approved-root listing/approval, scanning, search, and duplicate endpoints. It does not consume latest-file or individual-file endpoints directly.

The backend requires a directory to be approved before scanning. The frontend respects this flow by exposing approval first and re-indexing only returned approved roots.

## 17. Known Limitations and Technical Debt

- No frontend automated test suite is configured.
- No lint or format script is configured.
- The active UI contains legacy Settings implementations that are not routed but remain in source.
- Workspace file records and notes are not persisted across reloads.
- Browser upload metadata is not the same as a device-wide indexed file record.
- AI responses and CV analysis are intentionally backend-pending.
- Some buttons are visual or local-only and do not connect to services.
- Recharts increases the production bundle size; Vite reports a chunk over 500 kB.
- System-theme changes are applied when preferences are evaluated; there is no dedicated `matchMedia` change listener.
- The top bar and some page controls use local state independently of backend account state.
- No authentication means profile, account, security, notifications, and workflow settings cannot be persisted remotely.

## 18. Verification Snapshot

The repository has been inspected at source level. The current frontend build command is:

```text
npm run build
```

The build has previously completed successfully with Vite, with only the large-chunk warning noted above. Route smoke checks have returned HTTP 200 for `/`, `/documents`, `/settings`, and `/cv-to-notes` when the Vite server is running.

The backend test suite is separate from the frontend and has previously reported 17 passing tests with one Starlette/httpx deprecation warning. No frontend test command exists in `package.json`.

