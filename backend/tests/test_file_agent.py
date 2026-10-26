"""Tests for FileAgent tools against the real file index."""

from pathlib import Path

from app.agents import file_agent as file_agent_module
from app.agents.file_agent import FileAgent
from app.db import reset_file_index
from app.schemas.files import FileSearchRequest
from app.services.file_scanner import FileScanner


def test_file_agent_tools_use_approved_indexed_files(tmp_path: Path) -> None:
    file_index = reset_file_index(database_path=tmp_path / "agent.db")
    scan_dir = tmp_path / "files"
    scan_dir.mkdir()
    (scan_dir / "python-resume.txt").write_text("resume", encoding="utf-8")
    (scan_dir / "notes.md").write_text("notes", encoding="utf-8")

    file_index.approve_scan_root(str(scan_dir.resolve()))
    scanned = FileScanner().scan_directory(scan_dir)
    file_index.upsert_scanned_files(scanned.scan_root, scanned.files)

    agent = FileAgent(file_index=file_index)
    assert agent.available_tools() == [
        "search_files",
        "get_file_metadata",
        "find_duplicates",
        "find_latest_version",
    ]

    search = agent.search_files(FileSearchRequest(query="resume"))
    assert search.success is True
    assert len(search.data) == 1

    latest = agent.find_latest_version(FileSearchRequest(query="resume"))
    assert latest.success is True
    assert latest.data.name == "python-resume.txt"


def test_unused_protocol_abstractions_were_removed() -> None:
    assert not hasattr(file_agent_module, "FileSearchTool")
    assert not hasattr(file_agent_module, "FileMetadataTool")
    assert not hasattr(file_agent_module, "DuplicateDetectionTool")
    assert not hasattr(file_agent_module, "LatestVersionTool")
