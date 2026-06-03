export const documents = [
  { name: "Resume_v8.pdf", type: "PDF", status: "Latest Version", modified: "Today, 10:30 AM", versions: 8, folder: "CV / Resumes" },
  { name: "Resume_v5.pdf", type: "PDF", status: "3 Versions Behind", modified: "Yesterday, 09:15 PM", versions: 5, folder: "CV / Resumes" },
  { name: "FastAPI_Notes.pdf", type: "PDF", status: "Updated Today", modified: "Today, 08:45 AM", versions: 3, folder: "Notes" },
  { name: "Project_Ideas.txt", type: "Notes", status: "Up to Date", modified: "May 25, 2025", versions: 2, folder: "Notes" },
  { name: "Interview_QA.docx", type: "Docx", status: "Updated 2d ago", modified: "May 24, 2025", versions: 4, folder: "Interview Prep" },
  { name: "Backend_Roadmap.md", type: "Markdown", status: "Archive Recommended", modified: "May 16, 2025", versions: 1, folder: "AI Tools" },
];

export const folders = [
  { name: "CV / Resumes", count: 6, updated: "Today" },
  { name: "Notes", count: 18, updated: "Today" },
  { name: "Interview Prep", count: 9, updated: "Yesterday" },
  { name: "Mind Maps", count: 4, updated: "2d ago" },
];

export const activities = [
  "Resume_v8.pdf analyzed",
  "Notes generated",
  "Skills extracted",
  "Mind map created",
];

export const skills = [
  { name: "Python", value: 90 },
  { name: "FastAPI", value: 75 },
  { name: "SQL", value: 60 },
  { name: "MongoDB", value: 50 },
  { name: "Docker", value: 40 },
  { name: "Git", value: 70 },
  { name: "REST API", value: 65 },
];

export const statusStyles = {
  "Latest Version": "text-success bg-green-50 border-green-200",
  "Updated Today": "text-blueInk bg-blueSoft border-blue-200",
  "Up to Date": "text-success bg-green-50 border-green-200",
  "3 Versions Behind": "text-warning bg-amber-50 border-amber-200",
  "Updated 2d ago": "text-blueInk bg-blueSoft border-blue-200",
  "Archive Recommended": "text-danger bg-red-50 border-red-200",
};

export const suggestions = [
  "Summarize this CV",
  "Extract my top skills",
  "Generate interview questions",
  "Create revision sheet",
  "Suggest career roadmap",
];
