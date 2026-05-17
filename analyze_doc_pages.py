from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import zipfile

from lxml import etree


NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
}


@dataclass
class PageChunk:
    index: int
    has_text: bool
    has_drawing: bool
    text_chars: int
    page_breaks: int


def _is_page_break_paragraph(p: etree._Element) -> bool:
    # matches paragraphs that contain a page break
    return bool(p.xpath(".//w:br[@w:type='page']", namespaces=NS))


def _chunk_from_elements(index: int, elements: list[etree._Element], page_breaks: int) -> PageChunk:
    text_nodes = []
    for el in elements:
        text_nodes.extend(el.xpath(".//w:t/text()", namespaces=NS))
    text = "".join(text_nodes)
    has_text = bool(text.strip())
    has_drawing = any(
        bool(el.xpath(".//w:drawing", namespaces=NS)) or bool(el.xpath(".//w:pict", namespaces=NS))
        for el in elements
    )
    return PageChunk(
        index=index,
        has_text=has_text,
        has_drawing=has_drawing,
        text_chars=len(text.strip()),
        page_breaks=page_breaks,
    )


def main() -> None:
    root = Path(__file__).resolve().parent
    docx_path = root / "Chaukas_RoadSafety_Hackathon_2026.docx"
    if not docx_path.exists():
        raise FileNotFoundError(docx_path)

    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml")

    doc = etree.fromstring(xml)
    body = doc.xpath("/w:document/w:body", namespaces=NS)[0]

    chunks: list[PageChunk] = []
    current: list[etree._Element] = []
    chunk_index = 1
    break_count = 0

    # Iterate top-level block elements (paragraphs + tables)
    for child in body:
        tag = etree.QName(child).localname
        if tag == "p" and _is_page_break_paragraph(child):
            break_count += 1
            chunks.append(_chunk_from_elements(chunk_index, current, page_breaks=1))
            chunk_index += 1
            current = []
            continue
        if tag == "sectPr":
            # ignore section properties for chunking
            continue
        current.append(child)

    # final chunk
    chunks.append(_chunk_from_elements(chunk_index, current, page_breaks=0))

    blank = [c for c in chunks if not c.has_text and not c.has_drawing]

    print(f"Doc: {docx_path}")
    print(f"Explicit page-break chunks detected: {len(chunks)}")
    print(f"Blank chunks (no text, no drawings): {len(blank)}")

    for c in chunks:
        marker = "BLANK" if (not c.has_text and not c.has_drawing) else "OK"
        print(f"- Chunk {c.index:02d}: {marker} | text_chars={c.text_chars} drawings={c.has_drawing}")


if __name__ == "__main__":
    main()
