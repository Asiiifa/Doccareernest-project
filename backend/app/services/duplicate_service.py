"""Exact duplicate detection using SHA-256."""

from collections import defaultdict

from app.schemas.files import DuplicateFileInfo, DuplicateGroup, FileRecord


class DuplicateService:
    """Group indexed files that share the same SHA-256 hash."""

    def find_exact_duplicates(
        self,
        files: list[FileRecord],
        *,
        min_group_size: int = 2,
    ) -> list[DuplicateGroup]:
        groups_by_hash: dict[str, list[FileRecord]] = defaultdict(list)

        for record in files:
            if record.sha256:
                groups_by_hash[record.sha256].append(record)

        duplicate_groups: list[DuplicateGroup] = []
        for sha256, group_files in groups_by_hash.items():
            if len(group_files) < min_group_size:
                continue

            sorted_files = sorted(
                group_files,
                key=lambda item: item.modified_at or item.indexed_at,
                reverse=True,
            )
            duplicate_files = [
                DuplicateFileInfo(
                    id=item.id,
                    name=item.name,
                    full_path=item.full_path,
                    parent_directory=item.parent_directory,
                    size_bytes=item.size_bytes,
                    modified_at=item.modified_at,
                    created_at=item.created_at,
                )
                for item in sorted_files
            ]
            wasted_bytes = sorted_files[0].size_bytes * (len(sorted_files) - 1)

            duplicate_groups.append(
                DuplicateGroup(
                    sha256=sha256,
                    file_count=len(sorted_files),
                    total_wasted_bytes=wasted_bytes,
                    files=duplicate_files,
                )
            )

        duplicate_groups.sort(key=lambda group: group.file_count, reverse=True)
        return duplicate_groups
