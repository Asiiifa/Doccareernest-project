"""Future agentic AI tool interfaces for file intelligence.

This module defines deterministic tool boundaries that a future LLM agent
will orchestrate. No LLM calls are made in this milestone.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.db import FileIndex, get_file_index
from app.schemas.files import FileSearchRequest
from app.services.duplicate_service import DuplicateService


@dataclass
class FileAgentToolResult:
    """Normalized tool output for future agent reasoning."""

    tool_name: str
    success: bool
    data: object
    message: str


class FileAgent:
    """Tool-oriented file intelligence facade for future agent integration."""

    def __init__(
        self,
        file_index: FileIndex | None = None,
        duplicate_service: DuplicateService | None = None,
    ) -> None:
        self.file_index = file_index or get_file_index()
        self.duplicate_service = duplicate_service or DuplicateService()

    def search_files(self, request: FileSearchRequest) -> FileAgentToolResult:
        results = self.file_index.search(request)
        return FileAgentToolResult(
            tool_name="search_files",
            success=True,
            data=results,
            message=f"Found {len(results)} matching file(s).",
        )

    def get_file_metadata(self, file_id: str) -> FileAgentToolResult:
        record = self.file_index.get_by_id(file_id)
        if record is None:
            return FileAgentToolResult(
                tool_name="get_file_metadata",
                success=False,
                data=None,
                message=f"No indexed file found for id={file_id}.",
            )
        return FileAgentToolResult(
            tool_name="get_file_metadata",
            success=True,
            data=record,
            message=f"Loaded metadata for {record.name}.",
        )

    def find_duplicates(
        self,
        *,
        scan_root: str | None = None,
        min_group_size: int = 2,
    ) -> FileAgentToolResult:
        files = self.file_index.list_all(scan_root=scan_root)
        groups = self.duplicate_service.find_exact_duplicates(
            files, min_group_size=min_group_size
        )
        return FileAgentToolResult(
            tool_name="find_duplicates",
            success=True,
            data=groups,
            message=f"Identified {len(groups)} exact duplicate group(s).",
        )

    def find_latest_version(self, request: FileSearchRequest) -> FileAgentToolResult:
        results = self.file_index.search(request)
        if not results:
            return FileAgentToolResult(
                tool_name="find_latest_version",
                success=False,
                data=None,
                message="No candidate files matched the request.",
            )

        latest = max(
            results,
            key=lambda item: item.modified_at or item.created_at or item.indexed_at,
        )
        return FileAgentToolResult(
            tool_name="find_latest_version",
            success=True,
            data=latest,
            message=f"Latest candidate is {latest.name} at {latest.full_path}.",
        )

    def available_tools(self) -> list[str]:
        return [
            "search_files",
            "get_file_metadata",
            "find_duplicates",
            "find_latest_version",
        ]
