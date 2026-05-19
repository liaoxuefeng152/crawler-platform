from bs4 import BeautifulSoup
from markdownify import markdownify as md
from typing import Tuple, List

def html_to_structured_markdown(html: str) -> Tuple[str, dict]:
    """Extracts title, summary, infobox-like pairs and converts main content to markdown.
    Returns (markdown_text, metadata)
    """
    soup = BeautifulSoup(html, 'html.parser')
    metadata = {}

    # Title:
    title_tag = soup.find(['h1'])
    title = title_tag.get_text(strip=True) if title_tag else ''
    metadata['title'] = title

    # Try typical BaiduBaike summary
    summary_div = soup.select_one('.lemma-summary') or soup.select_one('.summary')
    summary = ''
    if summary_div:
        summary = '\n'.join(p.get_text(strip=True) for p in summary_div.select('.para') or [summary_div])
    else:
        # fallback: first paragraph
        p = soup.find('p')
        summary = p.get_text(strip=True) if p else ''
    metadata['summary'] = summary

    # Basic info box (dl dt/dd pairs)
    info = {}
    basic = soup.select_one('.basic-info') or soup.select_one('.basic-info-wrap')
    if basic:
        for dt, dd in zip(basic.select('dt'), basic.select('dd')):
            k = dt.get_text(strip=True)
            v = dd.get_text(strip=True)
            info[k] = v
    metadata['infobox'] = info

    # Extract main content container if possible
    content_node = soup.select_one('.lemma-content') or soup.select_one('#content') or soup.body
    markdown_text = ''
    if content_node:
        # Convert with markdownify, but keep heading hierarchy
        markdown_text = md(str(content_node), heading_style="ATX")

    # Prepend title and summary
    parts = []
    if title:
        parts.append(f"# {title}\n")
    if summary:
        parts.append(summary + "\n")
    parts.append(markdown_text)

    return '\n'.join(parts), metadata
