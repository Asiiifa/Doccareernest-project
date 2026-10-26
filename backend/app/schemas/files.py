"""Pydantic schemas for file intelligence APIs."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class FileRecord(BaseModel):
    """Indexed file metadata returned by the API."""

    id: str
    name: str
    full_path: str
    extension: str | None = None
    file_type: str
    size_bytes: int
    created_at: datetime | None = None
    modified_at: datetime | None = None
    accessed_at: datetime | None = None
    sha256: str | None = None
    parent_directory: str
    scan_root: str
    indexed_at: datetime


class ScanDirectoryRequest(BaseModel):
    """Request body for scanning a user-selected directory."""

    directory_path: str = Field(
        ...,
        description="Absolute or relative path to a directory explicitly selected for scanning.",
        examples=["D:\\Documents\\Resumes"],
    )
    compute_hashes: bool = Field(
        default=True,
        description="Whether to compute SHA-256 hashes during the scan.",
    )
    replace_existing_for_root: bool = Field(
        default=True,
        description="Replace previously indexed files from the same scan root.",
    )


class ScanError(BaseModel):
  path: str
  error: str


class ScanDirectoryResponse(BaseModel):
    scan_root: str
    files_scanned: int
    files_indexed: int
    files_skipped: int
    errors: list[ScanError] = Field(default_factory=list)
    files: list[FileRecord] = Field(default_factory=list)


class FileSearchRequest(BaseModel):
    query: str | None = Field(
        default=None,
        description="Free-text query matched against file name and path.",
    )
    extension: str | None = Field(default=None, examples=[".pdf"])
    file_type: str | None = Field(default=None, examples=["document"])
    parent_directory: str | None = None
    modified_after: datetime | None = None
    modified_before: datetime | None = None
    scan_root: str | None = None
    limit: int = Field(default=50, ge=1, le=500)


class FileSearchResponse(BaseModel):
    query: FileSearchRequest
    total: int
    results: list[FileRecord]


class DuplicateFileInfo(BaseModel):
    id: str
    name: str
    full_path: str
    parent_directory: str
    size_bytes: int
    modified_at: datetime | None = None
    created_at: datetime | None = None


class DuplicateGroup(BaseModel):
    sha256: str
    file_count: int
    total_wasted_bytes: int
    files: list[DuplicateFileInfo]


class DuplicatesRequest(BaseModel):
    scan_root: str | None = Field(
        default=None,
        description="Limit duplicate detection to files indexed from a specific scan root.",
    )
    min_group_size: int = Field(default=2, ge=2)


class DuplicatesResponse(BaseModel):
    duplicate_groups: list[DuplicateGroup]
    total_groups: int
    total_duplicate_files: int


class ErrorResponse(BaseModel):
    detail: str
    error_code: str | None = None


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    version: str


class ApproveScanRootRequest(BaseModel):
    directory_path: str = Field(
        ...,
        description="Directory the user explicitly approves for indexing.",
        examples=["D:\\Documents\\Resumes"],
    )


class ApprovedScanRoot(BaseModel):
    id: str
    path: str
    approved_at: datetime


class ApprovedScanRootListResponse(BaseModel):
    roots: list[ApprovedScanRoot]
    total: int


class LatestFileResponse(BaseModel):
    file: FileRecord | None = None


class RemovedApprovedScanRootResponse(BaseModel):
    id: str
    path: str
    files_removed: int


class StorageStatsResponse(BaseModel):
    approved_root_count: int
    indexed_file_count: int
    total_size_bytes: int
    duplicate_group_count: int
    duplicate_file_count: int
