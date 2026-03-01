"""PubMed RAG — retrieves citations via NCBI E-utilities (free API)."""

import os
import requests
import xml.etree.ElementTree as ET

# Base URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
# NCBI_API_KEY bumps rate limit from 3 to 10 req/sec
EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

NCBI_API_KEY = os.getenv("NCBI_API_KEY")

# Evidence grading by source domain
GRADE_A_SOURCES = {"nih.gov", "who.int", "cdc.gov", "acog.org", "cochrane.org"}
GRADE_B_SOURCES = {"nhs.uk", "mayoclinic.org", "bmj.com", "thelancet.com", "nejm.org"}


def _grade_source(affiliation: str) -> str:
    """Grade evidence source: A = top medical orgs, B = other peer-reviewed, C = other."""
    if not affiliation:
        return "B"
    affiliation_lower = affiliation.lower()
    for domain in GRADE_A_SOURCES:
        if domain.replace(".gov", "").replace(".org", "").replace(".int", "") in affiliation_lower:
            return "A"
    for domain in GRADE_B_SOURCES:
        if domain.replace(".com", "").replace(".org", "").replace(".uk", "") in affiliation_lower:
            return "B"
    return "B"


def _esearch(query: str, max_results: int) -> list[str]:
    """Search PubMed and return list of PMIDs."""
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retmode": "json",
        "sort": "relevance",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY

    response = requests.get(f"{EUTILS_BASE}/esearch.fcgi", params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    return data.get("esearchresult", {}).get("idlist", [])


def _efetch(pmids: list[str]) -> list[dict]:
    """Fetch abstracts for a list of PMIDs."""
    if not pmids:
        return []

    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
        "rettype": "abstract",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY

    response = requests.get(f"{EUTILS_BASE}/efetch.fcgi", params=params, timeout=15)
    response.raise_for_status()

    root = ET.fromstring(response.text)
    results = []

    for article in root.findall(".//PubmedArticle"):
        try:
            # Title
            title_el = article.find(".//ArticleTitle")
            title = title_el.text if title_el is not None else "No title"

            # Abstract
            abstract_parts = article.findall(".//AbstractText")
            abstract = " ".join(
                (el.text or "") for el in abstract_parts if el.text
            )

            # PMID
            pmid_el = article.find(".//PMID")
            pmid = pmid_el.text if pmid_el is not None else ""

            # Affiliation for grading
            affiliation_el = article.find(".//AffiliationInfo/Affiliation")
            affiliation = affiliation_el.text if affiliation_el is not None else ""

            if not abstract:
                continue

            results.append({
                "title":          title,
                "abstract":       abstract[:800],  # truncate for prompt
                "pmid":           pmid,
                "url":            f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                "evidence_grade": _grade_source(affiliation),
                "source":         f"PubMed PMID:{pmid}",
            })
        except Exception:
            continue

    return results


def search_pubmed(query: str, max_results: int = 3) -> list[dict]:
    """
    Search PubMed for evidence related to a health claim.

    Args:
        query:       Health claim or keywords to search
        max_results: Number of results to return

    Returns:
        List of dicts with keys: title, abstract, source, url, evidence_grade
        Sorted by evidence grade (A before B before C).
    """
    pmids = _esearch(query, max_results)
    results = _efetch(pmids)

    # Sort: A > B > C
    grade_order = {"A": 0, "B": 1, "C": 2}
    results.sort(key=lambda r: grade_order.get(r["evidence_grade"], 2))

    return results
