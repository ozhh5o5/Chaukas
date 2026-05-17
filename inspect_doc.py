from __future__ import annotations

from pathlib import Path

from docx import Document


def main() -> None:
    path = Path(__file__).resolve().parent / "Chaukas_RoadSafety_Hackathon_2026.docx"
    doc = Document(str(path))

    print(f"Doc: {path}")
    print("--- Headings / key paragraphs ---")

    for i, p in enumerate(doc.paragraphs):
        text = p.text.strip()
        if not text:
            continue
        if p.style.name.startswith("Heading") or i < 40:
            print(f"{i:04d} [{p.style.name}]: {text[:180]}")


if __name__ == "__main__":
    main()
