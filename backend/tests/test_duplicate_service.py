"""Tests for exact duplicate grouping."""

from datetime import datetime, timezone
from pathlib import Path

from app.schemas.files import FileRecord
from app.services.duplicate_service import DuplicateService


def _record(
    file_id: str,
    name: str,
    full_path: str,
    sha256: str | None,
    modified_at: datetime,
) -> FileRecord:
    return FileRecord(
        id=file_id,
        name=name,
        full_path=full_path,
        extension=".txt",
        file_type="document",
        size_bytes=100,
        created_at=modified_at,
        modified_at=modified_at,
        accessed_at=modified_at,
        sha256=sha256,
        parent_directory=str(Path(full_path).parent),
        scan_root="/scan",
        indexed_at=modified_at,
    )


def test_find_exact_duplicates_groups_by_sha256() -> None:
    now = datetime.now(timezone.utc)
    earlier = datetime(2024, 1, 1, tzinfo=timezone.utc)

    files = [
        _record("1", "resume.txt", "/docs/resume.txt", "hash-a", now),
        _record("2", "resume-copy.txt", "/backup/resume-copy.txt", "hash-a", earlier),
        _record("3", "notes.md", "/docs/notes.md", "hash-b", now),
    ]

    groups = DuplicateService().find_exact_duplicates(files)
    assert len(groups) == 1
    assert groups[0].sha256 == "hash-a"
    assert groups[0].file_count == 2
    assert groups[0].total_wasted_bytes == 100
    assert groups[0].files[0].name == "resume.txt"


def test_different_hashes_are_not_grouped() -> None:
    now = datetime.now(timezone.utc)
    files = [
        _record("1", "a.txt", "/a.txt", "hash-1", now),
        _record("2", "b.txt", "/b.txt", "hash-2", now),
    ]

    groups = DuplicateService().find_exact_duplicates(files)
    assert groups == []
