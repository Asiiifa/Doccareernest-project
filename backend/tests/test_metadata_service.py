"""Tests for metadata extraction service."""

from datetime import datetime, timezone
from pathlib import Path

from app.services.metadata_service import MetadataService


def test_extract_metadata_from_real_file(tmp_path: Path) -> None:
    file_path = tmp_path / "resume.pdf"
    file_path.write_bytes(b"%PDF-1.4 test")

    service = MetadataService()
    metadata = service.extract_metadata(file_path, sha256="abc123")

    assert metadata["name"] == "resume.pdf"
    assert metadata["extension"] == ".pdf"
    assert metadata["file_type"] == "document"
    assert metadata["size_bytes"] == len(b"%PDF-1.4 test")
    assert metadata["sha256"] == "abc123"
    assert metadata["parent_directory"] == str(tmp_path.resolve())
    assert isinstance(metadata["modified_at"], datetime)
    assert metadata["modified_at"].tzinfo == timezone.utc


def test_infer_file_type_for_unknown_extension() -> None:
    service = MetadataService()
    assert service.infer_file_type(".xyz") == "other"
