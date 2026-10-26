"""File intelligence API routes."""

import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status

from app.agents.file_agent import FileAgent
from app.db import get_file_index
from app.schemas.files import (
    ApprovedScanRoot,
    ApprovedScanRootListResponse,
    ApproveScanRootRequest,
    DuplicatesRequest,
    DuplicatesResponse,
    ErrorResponse,
    FileRecord,
    FileSearchRequest,
    FileSearchResponse,
    LatestFileResponse,
    RemovedApprovedScanRootResponse,
    ScanDirectoryRequest,
    ScanDirectoryResponse,
    ScanError,
    StorageStatsResponse,
)
from app.services.duplicate_service import DuplicateService
from app.services.file_scanner import FileScanner, ScanValidationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["files"])


def _validate_directory(directory_path: str):
    try:
        return FileScanner().validate_directory(directory_path)
    except ScanValidationError as exc:
        logger.warning("Invalid directory request: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post(
    "/approved-roots",
    response_model=ApprovedScanRoot,
    responses={400: {"model": ErrorResponse}},
)
def approve_scan_root(request: ApproveScanRootRequest) -> ApprovedScanRoot:
    resolved = _validate_directory(request.directory_path)
    return get_file_index().approve_scan_root(str(resolved))


@router.get("/approved-roots", response_model=ApprovedScanRootListResponse)
def list_approved_scan_roots() -> ApprovedScanRootListResponse:
    roots = get_file_index().list_approved_scan_roots()
    return ApprovedScanRootListResponse(roots=roots, total=len(roots))


@router.delete(
    "/approved-roots/{root_id}",
    response_model=RemovedApprovedScanRootResponse,
    responses={404: {"model": ErrorResponse}},
)
def remove_approved_scan_root(root_id: str) -> RemovedApprovedScanRootResponse:
    result = get_file_index().remove_approved_scan_root(root_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Approved folder not found: {root_id}",
        )
    removed_root, files_removed = result
    logger.info(
        "Removed approved root %s (%s); deleted %s indexed file(s)",
        removed_root.id,
        removed_root.path,
        files_removed,
    )
    return RemovedApprovedScanRootResponse(
        id=removed_root.id,
        path=removed_root.path,
        files_removed=files_removed,
    )


@router.post(
    "/scan",
    response_model=ScanDirectoryResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def scan_directory(request: ScanDirectoryRequest) -> ScanDirectoryResponse:
    resolved = _validate_directory(request.directory_path)
    file_index = get_file_index()
    if not file_index.is_approved_path(resolved):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Directory is not an approved scan root. "
                "Approve it first via POST /api/files/approved-roots."
            ),
        )

    try:
        scan_result = FileScanner().scan_directory(
            resolved,
            compute_hashes=request.compute_hashes,
        )
    except ScanValidationError as exc:
        logger.warning("Invalid scan request: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected scan failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File scan failed due to an internal error.",
        ) from exc

    if request.replace_existing_for_root:
        removed = file_index.delete_indexed_under_path(scan_result.scan_root)
        logger.info(
            "Removed %s existing indexed file(s) under %s before re-index",
            removed,
            scan_result.scan_root,
        )

    indexed_files = file_index.upsert_scanned_files(scan_result.scan_root, scan_result.files)

    return ScanDirectoryResponse(
        scan_root=scan_result.scan_root,
        files_scanned=scan_result.files_scanned,
        files_indexed=len(indexed_files),
        files_skipped=scan_result.files_skipped,
        errors=[ScanError(path=path, error=error) for path, error in scan_result.errors],
        files=indexed_files,
    )


@router.post("/search", response_model=FileSearchResponse)
def search_files(request: FileSearchRequest) -> FileSearchResponse:
    results = get_file_index().search(request)
    return FileSearchResponse(query=request, total=len(results), results=results)


@router.get("/latest", response_model=LatestFileResponse)
def get_latest_file(
    query: str | None = Query(default=None),
    extension: str | None = Query(default=None),
    file_type: str | None = Query(default=None),
    parent_directory: str | None = Query(default=None),
    scan_root: str | None = Query(default=None),
    modified_after: datetime | None = Query(default=None),
    modified_before: datetime | None = Query(default=None),
) -> LatestFileResponse:
    request = FileSearchRequest(
        query=query,
        extension=extension,
        file_type=file_type,
        parent_directory=parent_directory,
        scan_root=scan_root,
        modified_after=modified_after,
        modified_before=modified_before,
        limit=500,
    )
    result = FileAgent().find_latest_version(request)
    file_record = result.data if result.success else None
    return LatestFileResponse(file=file_record if isinstance(file_record, FileRecord) else None)


@router.get("/stats", response_model=StorageStatsResponse)
def get_storage_stats() -> StorageStatsResponse:
    file_index = get_file_index()
    files = file_index.list_all()
    groups = DuplicateService().find_exact_duplicates(files)
    return StorageStatsResponse(
        approved_root_count=len(file_index.list_approved_scan_roots()),
        indexed_file_count=len(files),
        total_size_bytes=sum(item.size_bytes for item in files),
        duplicate_group_count=len(groups),
        duplicate_file_count=sum(group.file_count for group in groups),
    )


@router.post("/duplicates", response_model=DuplicatesResponse)
def find_duplicates(request: DuplicatesRequest) -> DuplicatesResponse:
    file_index = get_file_index()
    duplicate_service = DuplicateService()
    files = file_index.list_all(scan_root=request.scan_root)
    groups = duplicate_service.find_exact_duplicates(
        files,
        min_group_size=request.min_group_size,
    )
    duplicate_file_count = sum(group.file_count for group in groups)
    return DuplicatesResponse(
        duplicate_groups=groups,
        total_groups=len(groups),
        total_duplicate_files=duplicate_file_count,
    )


@router.get(
    "/{file_id}",
    response_model=FileRecord,
    responses={404: {"model": ErrorResponse}},
)
def get_file(file_id: str) -> FileRecord:
    record = get_file_index().get_by_id(file_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indexed file not found: {file_id}",
        )
    return record
