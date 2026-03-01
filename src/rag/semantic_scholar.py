"""Semantic Scholar RAG — retrieves academic papers via Semantic Scholar API."""

import requests

SEMANTIC_SCHOLAR_BASE = "https://api.semanticscholar.org/graph/v1"

# No API key required for basic usage (rate limit: 100 req/5min)
FIELDS = "title,abstract,url,year,authors,externalIds"


def search_semantic_scholar(query: str, max_results: int = 3) -> list[dict]:
    """
    Search Semantic Scholar for academic papers related to a health claim.

    Args:
        query:       Health claim or keywords to search
        max_results: Number of results to return

    Returns:
        List of dicts with keys: title, abstract, source, url, evidence_grade
    """
    try:
        response = requests.get(
            f"{SEMANTIC_SCHOLAR_BASE}/paper/search",
            params={
                "query":  query,
                "limit":  max_results,
                "fields": FIELDS,
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
    except Exception:
        return []

    results = []
    for paper in data.get("data", []):
        abstract = paper.get("abstract") or ""
        if not abstract:
            continue

        # Build URL from DOI or paperId
        external_ids = paper.get("externalIds") or {}
        doi = external_ids.get("DOI")
        paper_id = paper.get("paperId", "")
        url = (
            f"https://doi.org/{doi}" if doi
            else f"https://www.semanticscholar.org/paper/{paper_id}"
        )

        results.append({
            "title":          paper.get("title", "No title"),
            "abstract":       abstract[:800],
            "url":            url,
            "source":         f"Semantic Scholar ({paper.get('year', 'n.d.')})",
            "evidence_grade": "B",
        })

    return results
