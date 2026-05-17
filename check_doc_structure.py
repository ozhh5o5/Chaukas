from __future__ import annotations

from pathlib import Path
import zipfile

from lxml import etree


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def main() -> None:
    root = Path(__file__).resolve().parent
    docx_path = root / "Chaukas_RoadSafety_Hackathon_2026.docx"
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml")

    doc = etree.fromstring(xml)
    body = doc.xpath("/w:document/w:body", namespaces=NS)[0]

    top_sectpr = [c for c in body if etree.QName(c).localname == "sectPr"]
    inner_sectpr = body.xpath(".//w:pPr/w:sectPr", namespaces=NS)

    print(f"Doc: {docx_path}")
    print(f"Body children: {len(body)}")
    print(f"Top-level w:sectPr: {len(top_sectpr)} (should be 1)")
    if top_sectpr:
        last_is_sectpr = etree.QName(body[-1]).localname == "sectPr"
        print(f"Last element is w:sectPr: {last_is_sectpr}")

    print(f"Paragraph-level section breaks (w:pPr/w:sectPr): {len(inner_sectpr)}")

    # Print types of section breaks if present
    for i, s in enumerate(inner_sectpr[:10], start=1):
        t = s.xpath("./w:type/@w:val", namespaces=NS)
        t_val = t[0] if t else "(default)"
        print(f"- Section break {i}: type={t_val}")


if __name__ == "__main__":
    main()
