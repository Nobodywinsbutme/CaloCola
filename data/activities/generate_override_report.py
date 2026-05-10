from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
INPUT_JSON = BASE_DIR / "exercise_dataset.json"
OUTPUT_REPORT = BASE_DIR / "override_summary_report.txt"


def build_override_report(input_path: Path) -> tuple[list[str], dict[str, int], int, int]:
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    merged_details = []
    merged_by_category: dict[str, int] = defaultdict(int)
    total_original_rows = 0

    for _, category_data in data.get("exercises", {}).items():
        category_name = category_data.get("category", "Unknown")
        for activity in category_data.get("activities", []):
            merged_from = activity.get("merged_from", [])
            if len(merged_from) > 1:
                merged_details.append(
                    {
                        "category": category_name,
                        "name": activity.get("name", "Unknown"),
                        "count": len(merged_from),
                        "sources": sorted(merged_from),
                    }
                )
                merged_by_category[category_name] += 1
                total_original_rows += len(merged_from)

    lines: list[str] = []
    lines.append("OVERRIDE / MERGE SUMMARY REPORT")
    lines.append("=" * 80)
    lines.append(f"Merged activities: {len(merged_details)}")
    lines.append(f"Total original rows represented by merged items: {total_original_rows}")
    lines.append("")
    lines.append("BY CATEGORY (number of merged activities)")
    lines.append("-" * 80)

    for category, count in sorted(merged_by_category.items(), key=lambda x: (-x[1], x[0])):
        lines.append(f"- {category}: {count}")

    lines.append("")
    lines.append("DETAILS")
    lines.append("-" * 80)

    for item in sorted(merged_details, key=lambda x: (x["category"], x["name"])):
        lines.append(f"[{item['category']}] {item['name']}  <-- merged from {item['count']} originals")
        for source in item["sources"]:
            lines.append(f"  - {source}")
        lines.append("")

    if not merged_details:
        lines.append("No merged activities found. Make sure convert_activities.py generated merged_from fields.")

    return lines, dict(merged_by_category), len(merged_details), total_original_rows


def save_report(lines: list[str], output_path: Path) -> None:
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main() -> None:
    if not INPUT_JSON.exists():
        print(f"Input file not found: {INPUT_JSON}")
        return

    lines, merged_by_category, merged_count, total_original_rows = build_override_report(INPUT_JSON)
    save_report(lines, OUTPUT_REPORT)

    print("Override report generated successfully")
    print(f"Output: {OUTPUT_REPORT}")
    print(f"Merged activities: {merged_count}")
    print(f"Original rows represented by merged activities: {total_original_rows}")
    print("\nTop categories with merged items:")

    if merged_by_category:
        for category, count in sorted(merged_by_category.items(), key=lambda x: (-x[1], x[0])):
            print(f"- {category}: {count}")
    else:
        print("- No merged items found")


if __name__ == "__main__":
    main()
