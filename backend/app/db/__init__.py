"""Lightweight SQLite index for scanned files."""

from __future__ import annotations

import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator

from app.core.config import Settings, get_settings
from app.schemas.files import ApprovedScanRoot, FileRecord, FileSearchRequest
from app.services.file_scanner import ScannedFile


def is_path_under_root(path: str | Path, root: str | Path) -> bool:
    """Return True if path is the approved root or a file/dir inside it."""
    try:
        resolved = Path(path).expanduser().resolve()
        approved = Path(root).expanduser().resolve()
        if resolved == approved or resolved.is_relative_to(approved):
            return True
        if os.name != "nt":
            return False
        resolved_key = os.path.normcase(str(resolved))
        approved_key = os.path.normcase(str(approved))
        if resolved_key == approved_key:
            return True
        prefix = approved_key if approved_key.endswith("\\") else approved_key + "\\"
        return resolved_key.startswith(prefix)
    except (OSError, ValueError, RuntimeError):
        return False


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_datetime(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value)


def _format_datetime(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()


class FileIndex:
    """SQLite-backed local file index for development."""

    def __init__(self, database_path: Path | None = None, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.database_path = database_path or self.settings.database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize_schema()

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def _initialize_schema(self) -> None:
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS indexed_files (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    full_path TEXT NOT NULL UNIQUE,
                    extension TEXT,
                    file_type TEXT NOT NULL,
                    size_bytes INTEGER NOT NULL,
                    created_at TEXT,
                    modified_at TEXT,
                    accessed_at TEXT,
                    sha256 TEXT,
                    parent_directory TEXT NOT NULL,
                    scan_root TEXT NOT NULL,
                    indexed_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_indexed_files_sha256
                    ON indexed_files(sha256);
                CREATE INDEX IF NOT EXISTS idx_indexed_files_name
                    ON indexed_files(name);
                CREATE INDEX IF NOT EXISTS idx_indexed_files_modified_at
                    ON indexed_files(modified_at);
                CREATE INDEX IF NOT EXISTS idx_indexed_files_scan_root
                    ON indexed_files(scan_root);

                CREATE TABLE IF NOT EXISTS approved_scan_roots (
                    id TEXT PRIMARY KEY,
                    path TEXT NOT NULL UNIQUE,
                    approved_at TEXT NOT NULL
                );
                """
            )

    def _row_to_record(self, row: sqlite3.Row) -> FileRecord:
        return FileRecord(
            id=row["id"],
            name=row["name"],
            full_path=row["full_path"],
            extension=row["extension"],
            file_type=row["file_type"],
            size_bytes=row["size_bytes"],
            created_at=_parse_datetime(row["created_at"]),
            modified_at=_parse_datetime(row["modified_at"]),
            accessed_at=_parse_datetime(row["accessed_at"]),
            sha256=row["sha256"],
            parent_directory=row["parent_directory"],
            scan_root=row["scan_root"],
            indexed_at=_parse_datetime(row["indexed_at"]) or _utc_now(),
        )

    def approve_scan_root(self, directory_path: str) -> ApprovedScanRoot:
        resolved = str(Path(directory_path).expanduser().resolve())
        approved_at = _utc_now()
        with self._connect() as connection:
            existing = connection.execute(
                "SELECT * FROM approved_scan_roots WHERE path = ?",
                (resolved,),
            ).fetchone()
            if existing:
                return ApprovedScanRoot(
                    id=existing["id"],
                    path=existing["path"],
                    approved_at=_parse_datetime(existing["approved_at"]) or approved_at,
                )

            root_id = str(uuid.uuid4())
            connection.execute(
                """
                INSERT INTO approved_scan_roots (id, path, approved_at)
                VALUES (?, ?, ?)
                """,
                (root_id, resolved, _format_datetime(approved_at)),
            )
        return ApprovedScanRoot(id=root_id, path=resolved, approved_at=approved_at)

    def list_approved_scan_roots(self) -> list[ApprovedScanRoot]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT * FROM approved_scan_roots ORDER BY approved_at DESC"
            ).fetchall()
        return [
            ApprovedScanRoot(
                id=row["id"],
                path=row["path"],
                approved_at=_parse_datetime(row["approved_at"]) or _utc_now(),
            )
            for row in rows
        ]

    def get_approved_scan_root(self, root_id: str) -> ApprovedScanRoot | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM approved_scan_roots WHERE id = ?",
                (root_id,),
            ).fetchone()
        if row is None:
            return None
        return ApprovedScanRoot(
            id=row["id"],
            path=row["path"],
            approved_at=_parse_datetime(row["approved_at"]) or _utc_now(),
        )

    def is_approved_path(self, path: str | Path) -> bool:
        for root in self.list_approved_scan_roots():
            if is_path_under_root(path, root.path):
                return True
        return False

    def _filter_approved(self, records: list[FileRecord]) -> list[FileRecord]:
        roots = self.list_approved_scan_roots()
        if not roots:
            return []
        return [
            record
            for record in records
            if any(is_path_under_root(record.full_path, root.path) for root in roots)
        ]

    def delete_by_scan_root(self, scan_root: str) -> int:
        with self._connect() as connection:
            cursor = connection.execute(
                "DELETE FROM indexed_files WHERE scan_root = ?",
                (scan_root,),
            )
            return cursor.rowcount

    def delete_indexed_under_path(self, directory_path: str) -> int:
        """Remove indexed files whose full path is the directory or inside it."""
        with self._connect() as connection:
            rows = connection.execute("SELECT id, full_path FROM indexed_files").fetchall()
            ids = [
                row["id"]
                for row in rows
                if is_path_under_root(row["full_path"], directory_path)
            ]
            if not ids:
                return 0
            placeholders = ",".join("?" for _ in ids)
            cursor = connection.execute(
                f"DELETE FROM indexed_files WHERE id IN ({placeholders})",
                ids,
            )
            return cursor.rowcount

    def remove_approved_scan_root(self, root_id: str) -> tuple[ApprovedScanRoot, int] | None:
        """Remove an approved root and indexed files no longer covered by any root."""
        existing = self.get_approved_scan_root(root_id)
        if existing is None:
            return None

        with self._connect() as connection:
            connection.execute("DELETE FROM approved_scan_roots WHERE id = ?", (root_id,))
            rows = connection.execute("SELECT id, full_path FROM indexed_files").fetchall()
            remaining = [
                row["path"]
                for row in connection.execute("SELECT path FROM approved_scan_roots").fetchall()
            ]
            stale_ids = [
                row["id"]
                for row in rows
                if not any(is_path_under_root(row["full_path"], root_path) for root_path in remaining)
            ]
            removed_count = 0
            if stale_ids:
                placeholders = ",".join("?" for _ in stale_ids)
                cursor = connection.execute(
                    f"DELETE FROM indexed_files WHERE id IN ({placeholders})",
                    stale_ids,
                )
                removed_count = cursor.rowcount

        return existing, removed_count

    def upsert_scanned_files(self, scan_root: str, files: list[ScannedFile]) -> list[FileRecord]:
        indexed_at = _utc_now()
        records: list[FileRecord] = []

        with self._connect() as connection:
            for scanned in files:
                existing = connection.execute(
                    "SELECT id FROM indexed_files WHERE full_path = ?",
                    (scanned.full_path,),
                ).fetchone()
                file_id = existing["id"] if existing else str(uuid.uuid4())

                connection.execute(
                    """
                    INSERT INTO indexed_files (
                        id, name, full_path, extension, file_type, size_bytes,
                        created_at, modified_at, accessed_at, sha256,
                        parent_directory, scan_root, indexed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(full_path) DO UPDATE SET
                        name = excluded.name,
                        extension = excluded.extension,
                        file_type = excluded.file_type,
                        size_bytes = excluded.size_bytes,
                        created_at = excluded.created_at,
                        modified_at = excluded.modified_at,
                        accessed_at = excluded.accessed_at,
                        sha256 = excluded.sha256,
                        parent_directory = excluded.parent_directory,
                        scan_root = excluded.scan_root,
                        indexed_at = excluded.indexed_at
                    """,
                    (
                        file_id,
                        scanned.name,
                        scanned.full_path,
                        scanned.extension,
                        scanned.file_type,
                        scanned.size_bytes,
                        _format_datetime(scanned.created_at),
                        _format_datetime(scanned.modified_at),
                        _format_datetime(scanned.accessed_at),
                        scanned.sha256,
                        scanned.parent_directory,
                        scan_root,
                        _format_datetime(indexed_at),
                    ),
                )

                row = connection.execute(
                    "SELECT * FROM indexed_files WHERE full_path = ?",
                    (scanned.full_path,),
                ).fetchone()
                if row is not None:
                    records.append(self._row_to_record(row))

        return records

    def get_by_id(self, file_id: str) -> FileRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM indexed_files WHERE id = ?",
                (file_id,),
            ).fetchone()
        if row is None:
            return None
        record = self._row_to_record(row)
        if not self.is_approved_path(record.full_path):
            return None
        return record

    def list_all(self, *, scan_root: str | None = None) -> list[FileRecord]:
        query = "SELECT * FROM indexed_files"
        params: tuple[object, ...] = ()
        if scan_root:
            query += " WHERE scan_root = ?"
            params = (scan_root,)
        query += " ORDER BY modified_at DESC"

        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        return self._filter_approved([self._row_to_record(row) for row in rows])

    def search(self, request: FileSearchRequest) -> list[FileRecord]:
        if not self.list_approved_scan_roots():
            return []

        clauses: list[str] = []
        params: list[object] = []

        if request.query:
            like_value = f"%{request.query.lower()}%"
            clauses.append("(LOWER(name) LIKE ? OR LOWER(full_path) LIKE ?)")
            params.extend([like_value, like_value])

        if request.extension:
            extension = request.extension.lower()
            if not extension.startswith("."):
                extension = f".{extension}"
            clauses.append("LOWER(extension) = ?")
            params.append(extension)

        if request.file_type:
            clauses.append("LOWER(file_type) = ?")
            params.append(request.file_type.lower())

        if request.parent_directory:
            clauses.append("parent_directory LIKE ?")
            params.append(f"{request.parent_directory}%")

        if request.scan_root:
            clauses.append("scan_root = ?")
            params.append(request.scan_root)

        if request.modified_after:
            clauses.append("modified_at >= ?")
            params.append(_format_datetime(request.modified_after))

        if request.modified_before:
            clauses.append("modified_at <= ?")
            params.append(_format_datetime(request.modified_before))

        where_clause = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        query = f"""
            SELECT * FROM indexed_files
            {where_clause}
            ORDER BY modified_at DESC
        """

        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        approved = self._filter_approved([self._row_to_record(row) for row in rows])
        return approved[: request.limit]


_file_index: FileIndex | None = None


def get_file_index() -> FileIndex:
    global _file_index
    if _file_index is None:
        _file_index = FileIndex()
    return _file_index


def reset_file_index(database_path: Path | None = None) -> FileIndex:
    """Create a fresh index instance (used in tests)."""
    global _file_index
    _file_index = FileIndex(database_path=database_path)
    return _file_index
