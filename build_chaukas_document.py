from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import runpy

from docx import Document


ROOT = Path(__file__).resolve().parent


def merge_docx(part_a: Path, part_b: Path, out_path: Path) -> None:
    doc_a = Document(str(part_a))
    doc_b = Document(str(part_b))

    body_a = doc_a.element.body
    body_b = doc_b.element.body

    # WordprocessingML requires the document body to end with exactly one w:sectPr.
    # The previous implementation appended Part B *after* Part A's sectPr and also
    # copied Part B's sectPr, which can cause Word to insert blank pages or layout glitches.
    insert_at = len(body_a) - 1  # position right before Part A's final sectPr

    # Copy all Part B body children except the final sectPr.
    # (docx has body-level sectPr as the last element.)
    for element in list(body_b)[:-1]:
        body_a.insert(insert_at, deepcopy(element))
        insert_at += 1

    doc_a.save(str(out_path))


def main() -> None:
    # 1) Figures
    runpy.run_path(str(ROOT / "gen_charts2.py"), run_name="__main__")

    # 2) Document parts
    runpy.run_path(str(ROOT / "gen_docA.py"), run_name="__main__")
    runpy.run_path(str(ROOT / "gen_docB.py"), run_name="__main__")

    part_a = ROOT / "_doc_partA.docx"
    part_b = ROOT / "_doc_partB.docx"
    out_doc = ROOT / "Chaukas_RoadSafety_Hackathon_2026.docx"

    if not part_a.exists() or not part_b.exists():
        raise FileNotFoundError("Missing _doc_partA.docx or _doc_partB.docx; generation step failed.")

    merge_docx(part_a, part_b, out_doc)
    print(f"Generated: {out_doc}")


if __name__ == "__main__":
    main()
