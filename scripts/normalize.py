"""
Normalization utilities for VIGIL PDF ingestion pipeline.
Handles deterministic project identity, date formatting, progress normalization,
and currency parsing.
"""

import re
import hashlib
from typing import Optional, Tuple

MONTH_NAME_MAP = {
    "january": "01", "february": "02", "march": "03", "april": "04",
    "may": "05", "june": "06", "july": "07", "august": "08",
    "september": "09", "october": "10", "november": "11", "december": "12",
    "jan": "01", "feb": "02", "mar": "03", "apr": "04", "jun": "06",
    "jul": "07", "aug": "08", "sep": "09", "sept": "09", "oct": "10",
    "nov": "11", "dec": "12"
}

PROJECT_CODE_REGEX = re.compile(r'[Nn]\d{8}|\b\d{9}\b')

def clean_text(text: Optional[str]) -> str:
    """Strip whitespace and non-standard spacing characters."""
    if not text:
        return ""
    # Replace non-breaking spaces and other control chars
    t = text.replace("\xa0", " ").replace("\r", " ")
    # Collapse multiple whitespace characters
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def extract_project_code(text: str) -> Optional[str]:
    """Find MoSPI project code (e.g. N24000767, 020100044) in text."""
    if not text:
        return None
    matches = PROJECT_CODE_REGEX.findall(text)
    if matches:
        return matches[0].upper()
    return None

def generate_deterministic_project_id(project_name: str, sector: str = "", ministry: str = "", state: str = "") -> str:
    """
    Generate a deterministic fallback project ID when explicit code is missing.
    Format: PRJ_<12-hex-chars>
    """
    norm_name = re.sub(r'[^A-Z0-9]', '', (project_name or "").upper())
    norm_sec = re.sub(r'[^A-Z0-9]', '', (sector or "").upper())
    norm_min = re.sub(r'[^A-Z0-9]', '', (ministry or "").upper())
    norm_st = re.sub(r'[^A-Z0-9]', '', (state or "").upper())
    
    composite = f"{norm_name}|{norm_sec}|{norm_min}|{norm_st}"
    h = hashlib.sha256(composite.encode('utf-8')).hexdigest()[:12].upper()
    return f"PRJ_{h}"

def normalize_project_id(raw_code: Optional[str], project_name: str, sector: str = "", ministry: str = "", state: str = "") -> str:
    """Return explicit project code if available, else deterministic ID. Returns empty string if invalid/empty."""
    code = extract_project_code(raw_code or "")
    if not code:
        code = extract_project_code(project_name or "")
    if code:
        return code
    cleaned_name = clean_text(project_name)
    if not cleaned_name or len(cleaned_name) < 3 or cleaned_name.isdigit():
        return ""
    return generate_deterministic_project_id(project_name, sector, ministry, state)

def normalize_month(date_str: Optional[str]) -> Optional[str]:
    """
    Normalize various date strings to strict YYYY-MM.
    Supports:
      - 04/2023, 4/2023, 04-2023, 4-2023
      - 2023-04
      - April, 2023, April 2023, Apr-23, May-22
      - {04/2023}, [04/2023], (04/2023)
    Returns None if missing, (-) or (N.A.).
    """
    if not date_str:
        return None
    
    s = clean_text(date_str)
    # Strip brackets/parentheses
    s = re.sub(r'[\[\]\(\)\{\}]', '', s).strip()
    
    if s in ["", "-", "--", "N.A.", "NA", "N.A", "N/A", "Nil", "NIL"]:
        return None
        
    # Pattern 1: YYYY-MM or YYYY/MM
    m = re.match(r'^(\d{4})[-/](\d{1,2})$', s)
    if m:
        year, month = m.group(1), int(m.group(2))
        if 1 <= month <= 12:
            return f"{year}-{month:02d}"
            
    # Pattern 2: MM/YYYY or M/YYYY or MM-YYYY or M-YYYY
    m = re.match(r'^(\d{1,2})[-/](\d{4})$', s)
    if m:
        month, year = int(m.group(1)), m.group(2)
        if 1 <= month <= 12:
            return f"{year}-{month:02d}"
            
    # Pattern 3: Month YYYY or Month, YYYY or Month-YYYY
    m = re.match(r'^([A-Za-z]+)[\s,-]+(\d{4})$', s)
    if m:
        m_name = m.group(1).lower()
        year = m.group(2)
        if m_name in MONTH_NAME_MAP:
            return f"{year}-{MONTH_NAME_MAP[m_name]}"
            
    # Pattern 4: Month-YY (e.g. May-22, Oct-24)
    m = re.match(r'^([A-Za-z]+)[\s,-]+(\d{2})$', s)
    if m:
        m_name = m.group(1).lower()
        yy = int(m.group(2))
        year = f"20{yy:02d}" if yy < 70 else f"19{yy:02d}"
        if m_name in MONTH_NAME_MAP:
            return f"{year}-{MONTH_NAME_MAP[m_name]}"
            
    # Pattern 5: Embedded date inside longer string
    m = re.search(r'(\d{1,2})[/](\d{4})', s)
    if m:
        month, year = int(m.group(1)), m.group(2)
        if 1 <= month <= 12:
            return f"{year}-{month:02d}"
            
    m = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)[\s,]+(20\d{2})', s, re.IGNORECASE)
    if m:
        m_name = m.group(1).lower()
        year = m.group(2)
        if m_name in MONTH_NAME_MAP:
            return f"{year}-{MONTH_NAME_MAP[m_name]}"

    return None

def normalize_progress(val: Optional[str]) -> Optional[float]:
    """
    Convert progress string to numeric float between 0.0 and 100.0.
    Handles '42%', '42.5 %', '0.42' -> 42.0.
    Returns None if missing, N.A., or unparseable.
    """
    if val is None:
        return None
    s = clean_text(str(val))
    s = s.replace("%", "").strip()
    s = re.sub(r'[\[\]\(\)\{\}]', '', s).strip()
    
    if s in ["", "-", "--", "N.A.", "NA", "N.A", "N/A", "Nil", "NIL"]:
        return None
        
    try:
        f = float(s.replace(",", ""))
        # Check if source represented progress as fraction (e.g. 0.42 -> 42.0)
        if 0.0 < f < 1.0:
            f = f * 100.0
        if 0.0 <= f <= 100.0:
            return round(f, 2)
        # Some projects report progress up to 100%
        return None
    except ValueError:
        return None

def normalize_money(val: Optional[str]) -> Optional[float]:
    """
    Parse monetary values (in Rs. crore).
    Handles commas ('1,420.00', '1,16,741.00').
    Returns float or None.
    """
    if val is None:
        return None
    s = clean_text(str(val))
    s = re.sub(r'[\[\]\(\)\{\}]', '', s).strip()
    
    if s in ["", "-", "--", "N.A.", "NA", "N.A", "N/A", "Nil", "NIL"]:
        return None
        
    # Remove currency symbols and word indicators, but PRESERVE decimal point
    s = re.sub(r'[₹\s]', '', s)
    s = re.sub(r'(?i)rs\.?|crore', '', s).strip()
    try:
        f = float(s.replace(",", ""))
        return round(f, 2)
    except ValueError:
        # Check for first float in string
        m = re.search(r'[-+]?\d+(?:,\d+)*(?:\.\d+)?', s)
        if m:
            try:
                clean_num = m.group(0).replace(",", "")
                return round(float(clean_num), 2)
            except ValueError:
                return None
        return None

def extract_multi_field(cell_text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Extract multi-line values often formatted as:
    Original
    (Revised)
    {Anticipated} or [Anticipated]
    
    Returns (original, revised, anticipated)
    """
    if not cell_text:
        return None, None, None
    lines = [l.strip() for l in cell_text.splitlines() if l.strip()]
    if not lines:
        return None, None, None
        
    orig = None
    rev = None
    antic = None
    
    for l in lines:
        if l.startswith("{") or l.startswith("["):
            antic = l
        elif l.startswith("(") and l.endswith(")"):
            rev = l
        elif orig is None:
            orig = l
        elif rev is None:
            rev = l
        elif antic is None:
            antic = l
            
    return orig, rev, antic
