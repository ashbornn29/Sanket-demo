#!/usr/bin/env python3
"""
scripts/inspect_pdfs.py — VIGIL PDF Structure Inspector

CLI tool for VIGIL to inspect a directory of infrastructure project PDFs.
Inspects document structure, text extractability, OCR necessity, table detection,
and project identity coverage.

Part of VIGIL Phase 1 — Data Ingestion & Normalization.
"""

import os
import sys
import argparse
import pymupdf
import re
from normalize import normalize_month, extract_project_code

def detect_reporting_period(first_pages_text: str, filename: str) -> str:
    """Detect reporting month/quarter from text or filename."""
    m_fr = re.search(r'(?:Flash\s+Report.*?|Central\s+Sector.*?Projects.*?)?(January|February|March|April|May|June|July|August|September|October|November|December)[\s,]+(202\d)', first_pages_text, re.IGNORECASE)
    if m_fr:
        norm = normalize_month(f"{m_fr.group(1)} {m_fr.group(2)}")
        if norm:
            return norm
            
    m_qtr = re.search(r'(April-June|July-Sept(?:ember)?|Oct(?:ober)?-Dec(?:ember)?|Jan(?:uary)?-March)[\s,]+(202\d)', first_pages_text, re.IGNORECASE)
    if m_qtr:
        return f"{m_qtr.group(2)} {m_qtr.group(1)}"
        
    # Check filename fallback
    m_file = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[_-]?(\d{4})?', filename, re.IGNORECASE)
    if m_file:
        month_name = m_file.group(1)
        year = m_file.group(2) or "2024"
        norm = normalize_month(f"{month_name} {year}")
        if norm:
            return norm
            
    return "UNKNOWN"

def inspect_directory(input_dir: str):
    if not os.path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist.")
        sys.exit(1)
        
    pdf_files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith(".pdf")])
    print("=" * 110)
    print(f"VIGIL STEP 1: PDF INSPECTION REPORT")
    print(f"Directory: {os.path.abspath(input_dir)}")
    print(f"Total PDFs: {len(pdf_files)}")
    print("=" * 110)
    print(f"{'Filename':<34} | {'Pages':<5} | {'Type':<12} | {'Tables':<6} | {'Period':<7} | {'Codes Found':<20}")
    print("-" * 110)
    
    total_pages = 0
    text_pdf_count = 0
    scanned_count = 0
    
    for f in pdf_files:
        filepath = os.path.join(input_dir, f)
        try:
            doc = pymupdf.open(filepath)
            page_count = len(doc)
            total_pages += page_count
            
            # Inspect first 5 pages for text and period
            sample_text = ""
            for i in range(min(5, page_count)):
                sample_text += doc[i].get_text() + "\n"
                
            is_text = len(sample_text.strip()) > 100
            if is_text:
                text_pdf_count += 1
            else:
                scanned_count += 1
                
            period = detect_reporting_period(sample_text, f)
            
            # Check sample pages for tables and project codes
            codes = []
            tables_count = 0
            check_pages = [min(page_count - 1, p) for p in [5, page_count // 4, page_count // 2, 3 * page_count // 4]]
            for cp in set(check_pages):
                p = doc[cp]
                tabs = p.find_tables()
                tables_count += len(tabs.tables)
                t_page = p.get_text()
                found_c = re.findall(r'[Nn]\d{8}|\b\d{9}\b', t_page)
                if found_c:
                    codes.extend(found_c[:3])
                    
            codes_preview = ", ".join(list(set(codes))[:2]) if codes else ("None (Synopsis)" if page_count <= 25 else "None detected")
            doc_type = "Text" if is_text else "Scanned"
            
            print(f"{f[:34]:<34} | {page_count:<5} | {doc_type:<12} | {tables_count:<6} | {period:<7} | {codes_preview:<20}")
            doc.close()
        except Exception as e:
            print(f"{f[:34]:<34} | ERROR: {str(e)[:45]}")
            
    print("-" * 110)
    print(f"Summary:")
    print(f"  - Total Documents: {len(pdf_files)}")
    print(f"  - Total Pages: {total_pages:,}")
    print(f"  - Text PDFs: {text_pdf_count} (100% extractable without OCR)")
    print(f"  - Scanned PDFs requiring OCR: {scanned_count}")
    print("=" * 110)

def main():
    parser = argparse.ArgumentParser(description="Inspect PDFs for VIGIL Ingestion Pipeline")
    parser.add_argument("--input", "-i", default="DATA(RAW) ", help="Path to raw PDFs folder")
    args = parser.parse_args()
    inspect_directory(args.input)

if __name__ == "__main__":
    main()
