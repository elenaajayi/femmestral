"""PubMed RAG — retrieves citations via NCBI E-utilities (free API)."""

# Base URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
# No key needed; NCBI_API_KEY bumps rate limit from 3 to 10 req/sec
# Docs: https://www.ncbi.nlm.nih.gov/books/NBK25497/

EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

# Trusted sources to prioritise in results
TRUSTED_DOMAINS = [
    "who.int", "cdc.gov", "nih.gov", "acog.org",
    "nhs.uk", "mayoclinic.org", "cochrane.org"
]


def search_pubmed(query: str, max_results: int = 5) -> list[dict]:
    """
    Search PubMed for evidence related to a health claim.

    Args:
        query: Health claim or keywords to search
        max_results: Number of results to return

    Returns:
        list of dicts with keys: title, abstract, source, url, evidence_grade
    """
    # TODO:
    # 1. ESearch: POST to {EUTILS_BASE}/esearch.fcgi?db=pubmed&term={query}&retmax={max_results}
    # 2. EFetch: retrieve abstracts for returned PMIDs
    # 3. Grade each result (A=NIH/WHO/CDC, B=hospital/university, C=other)
    # 4. Return sorted by evidence grade
    raise NotImplementedError
