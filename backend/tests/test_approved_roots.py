"""Tests for approved scan-root persistence and path checks."""

from pathlib import Path

from app.agents.file_agent import FileAgent
from app.db import FileIndex, is_path_under_root
from app.schemas.files import FileSearchRequest
from app.services.file_scanner import FileScanner


def test_is_path_under_root_accepts_root_and_child(tmp_path: Path) -> None:
    child = tmp_path / "nested" / "file.txt"
    child.parent.mkdir()
    child.write_text("x", encoding="utf-8")

    assert is_path_under_root(tmp_path, tmp_path) is True
    assert is_path_under_root(child, tmp_path) is True
    assert is_path_under_root(tmp_path.parent / "not-approved", tmp_path) is False


def test_approved_root_is_persisted(tmp_path: Path) -> None:
    index = FileIndex(database_path=tmp_path / "index.db")
    target = tmp_path / "docs"
    target.mkdir()

    first = index.approve_scan_root(str(target))
    second = index.approve_scan_root(str(target))

    assert first.path == str(target.resolve())
    assert first.id == second.id
    assert len(index.list_approved_scan_roots()) == 1
    assert index.is_approved_path(target / "resume.pdf") is True
    assert index.is_approved_path(tmp_path / "elsewhere") is False


def test_file_agent_latest_uses_approved_index(tmp_path: Path) -> None:
    index = FileIndex(database_path=tmp_path / "index.db")
    docs = tmp_path / "docs"
    docs.mkdir()
    (docs / "resume.txt").write_text("cv", encoding="utf-8")
    index.approve_scan_root(str(docs))

    scan = FileScanner().scan_directory(docs)
    index.upsert_scanned_files(scan.scan_root, scan.files)

    agent = FileAgent(file_index=index)
    result = agent.find_latest_version(FileSearchRequest(query="resume"))
    assert result.success is True
    assert result.data is not None
    assert result.data.name == "resume.txt"
