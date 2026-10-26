import { useEffect, useRef, useState } from "react";
import Check from "lucide-react/dist/esm/icons/check.js";
import Eraser from "lucide-react/dist/esm/icons/eraser.js";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical.js";
import Pencil from "lucide-react/dist/esm/icons/pencil.js";
import Pin from "lucide-react/dist/esm/icons/pin.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import Star from "lucide-react/dist/esm/icons/star.js";
import Trash2 from "lucide-react/dist/esm/icons/trash-2.js";
import X from "lucide-react/dist/esm/icons/x.js";

export default function StickyNote({ title = "Quick Note", children, smile = false }) {
  const initialText = typeof children === "string" ? children : "";
  const [text, setText] = useState(initialText);
  const [draft, setDraft] = useState(initialText);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [starred, setStarred] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [extraNotes, setExtraNotes] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  function startEditing() {
    setDraft(text);
    setEditing(true);
    setMenuOpen(false);
  }

  function saveEdit() {
    setText(draft.trim());
    setEditing(false);
  }

  function cancelEdit() {
    setDraft(text);
    setEditing(false);
  }

  function addStickyNote() {
    setExtraNotes((notes) => [...notes, { id: `${Date.now()}-${notes.length}` }]);
    setMenuOpen(false);
  }

  if (deleted) {
    return <div className="rounded-md border border-dashed border-borderSoft p-3 text-sm text-mutedInk"><span>Sticky note deleted.</span><button onClick={() => setDeleted(false)} className="tap-feedback ml-2 font-semibold text-blueInk"><RotateCcw className="mr-1 inline h-3.5 w-3.5" />Restore</button></div>;
  }

  return (
    <div className="space-y-4">
    <div className="relative rounded-sm border border-stickyDark bg-sticky p-4 shadow-sticky">
      {pinned && <Pin className="absolute right-20 top-2 h-4 w-4 text-ink" />}
      <div className="mb-3 flex items-start justify-between gap-3 pr-8">
        <h3 className="hand-title text-base font-semibold">{emoji} {title}</h3>
        <div ref={menuRef} className="absolute right-2 top-1 flex items-center gap-0.5">
          <button onClick={startEditing} className="tap-feedback rounded-md p-1.5 text-ink hover:bg-stickyDark" aria-label="Edit sticky note" title="Edit note"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={() => setMenuOpen((open) => !open)} className="tap-feedback rounded-md p-1.5 text-ink hover:bg-stickyDark" aria-label="More sticky note options" aria-expanded={menuOpen} title="More options"><MoreVertical className="h-3.5 w-3.5" /></button>
          {menuOpen && <div className="notebook-paper absolute right-0 top-8 z-20 w-44 rounded-md border border-borderSoft p-1.5 text-sm shadow-lg">
            <button onClick={startEditing} className="tap-feedback flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-blueSoft"><Pencil className="h-3.5 w-3.5" />Edit note</button>
            <button onClick={() => { setText(""); setDraft(""); setEditing(true); setMenuOpen(false); }} className="tap-feedback flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-blueSoft"><Eraser className="h-3.5 w-3.5" />Erase content</button>
            <button onClick={addStickyNote} className="tap-feedback flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-blueSoft"><Plus className="h-3.5 w-3.5" />Add sticky note</button>
            <div className="border-t border-borderSoft px-2 pb-1 pt-2 text-xs text-mutedInk">Add emoji</div>
            <div className="flex flex-wrap gap-1 px-2 pb-2">{["💡", "⭐", "📌", "✅", "📝", "🎯"].map((item) => <button key={item} onClick={() => { setEmoji(item); setMenuOpen(false); }} className="tap-feedback rounded p-1 text-base hover:bg-blueSoft" aria-label={`Use ${item} emoji`}>{item}</button>)}</div>
            <button onClick={() => { setPinned((value) => !value); setMenuOpen(false); }} className="tap-feedback flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-blueSoft"><Pin className="h-3.5 w-3.5" />{pinned ? "Unpin note" : "Pin note"}</button>
            <button onClick={() => { setDeleted(true); setMenuOpen(false); }} className="tap-feedback flex w-full items-center gap-2 rounded px-2 py-2 text-left text-danger hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Delete note</button>
          </div>}
        </div>
      </div>
      {editing ? <div className="space-y-2"><textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} className="ink-focus min-h-24 w-full resize-y rounded-md border border-stickyDark bg-sticky/80 p-2 text-sm text-ink outline-none" aria-label="Edit sticky note content" /><div className="flex items-center gap-2"><button onClick={saveEdit} className="tap-feedback inline-flex items-center gap-1 rounded-md bg-blueInk px-2.5 py-1.5 text-xs font-semibold text-white"><Check className="h-3.5 w-3.5" />Save</button><button onClick={cancelEdit} className="tap-feedback inline-flex items-center gap-1 rounded-md border border-stickyDark px-2.5 py-1.5 text-xs font-semibold text-ink"><X className="h-3.5 w-3.5" />Cancel</button></div></div> : <div className="hand-title text-sm leading-6 text-ink">{text || <span className="text-mutedInk">This note is empty. Choose edit to add a reminder.</span>}</div>}
      {!editing && <div className="mt-3 flex items-center justify-between"><button onClick={() => setStarred((value) => !value)} className={`tap-feedback rounded-md p-1 ${starred ? "text-[#8c6b00]" : "text-ink"}`} aria-label={starred ? "Unfavorite note" : "Favorite note"} aria-pressed={starred}><Star className="h-6 w-6" fill={starred ? "currentColor" : "none"} /></button>{smile && <div className="h-5 w-12 rounded-b-full border-b-2 border-r-2 border-ink" />}</div>}
      <Sparkles className="absolute bottom-3 right-3 h-4 w-4 text-ink" />
    </div>
    {extraNotes.map((note) => <StickyNote key={note.id} title="New Note" smile />)}
    </div>
  );
}
