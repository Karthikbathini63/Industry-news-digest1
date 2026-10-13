import { XMLParser } from 'fast-xml-parser';
import { db } from './db.js';
import { Article } from './types.js';

export interface VettedRssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
}

export const VETTED_FEEDS: VettedRssFeed[] = [
  {
    id: 'hn-tech',
    name: 'Hacker News Frontpage',
    url: 'https://news.ycombinator.com/rss',
    category: 'Technology',
    description: 'Top technology, engineering, and startup dispatches curated by the global technical community.',
  },
  {
    id: 'arxiv-ai',
    name: 'arXiv Computer Science & AI',
    url: 'https://rss.arxiv.org/rss/cs.AI',
    category: 'AI & Data',
    description: 'Preprints and breakthrough research in artificial intelligence and machine learning architectures.',
  },
  {
    id: 'bbc-tech',
    name: 'BBC Technology News',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Technology',
    description: 'Global technology reporting, digital policy, security, and consumer platforms.',
  },
  {
    id: 'nasa-tech',
    name: 'NASA Science & Technology',
    url: 'https://www.nasa.gov/news-release/feed/',
    category: 'Clean Energy & Climate',
    description: 'Space science, propulsion breakthroughs, earth observation data, and aerospace engineering.',
  },
];

function stripHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function ingestRssFeed(feedUrl: string, feedCategory?: string, customSourceName?: string): Promise<{
  importedCount: number;
  skippedCount: number;
  sourceName: string;
}> {
  let sourceName = customSourceName || 'RSS Feed';
  let importedCount = 0;
  let skippedCount = 0;

  try {
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'IndustryNewsDigestReader/1.0 (Public RSS Reader)',
        'Accept': 'application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      throw new Error(`Feed responded with HTTP ${res.status}: ${res.statusText}`);
    }

    const xmlText = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      trimValues: true,
    });
    const parsed = parser.parse(xmlText);

    let rawItems: any[] = [];

    // RSS 2.0 check
    if (parsed.rss?.channel) {
      sourceName = customSourceName || parsed.rss.channel.title || 'RSS Feed';
      const items = parsed.rss.channel.item;
      rawItems = Array.isArray(items) ? items : items ? [items] : [];
    }
    // Atom check
    else if (parsed.feed) {
      sourceName = customSourceName || parsed.feed.title || 'Atom Feed';
      const entries = parsed.feed.entry;
      rawItems = Array.isArray(entries) ? entries : entries ? [entries] : [];
    } else {
      throw new Error('Unrecognized syndication format. Expected valid RSS 2.0 or Atom XML feed.');
    }

    const category = feedCategory || 'Technology';

    for (const item of rawItems) {
      const headline = stripHtml(item.title || 'Untitled Article');
      let canonicalUrl = '';

      if (typeof item.link === 'string') {
        canonicalUrl = item.link;
      } else if (item.link?.['@_href']) {
        canonicalUrl = item.link['@_href'];
      } else if (item.guid && typeof item.guid === 'string' && item.guid.startsWith('http')) {
        canonicalUrl = item.guid;
      }

      if (!canonicalUrl || !headline) {
        continue;
      }

      // Check if duplicate exists
      const existing = db.findByCanonicalUrl(canonicalUrl);
      if (existing) {
        skippedCount++;
        continue;
      }

      const rawDesc = item.description || item.summary || item['content:encoded'] || item.content || '';
      const cleanDesc = stripHtml(typeof rawDesc === 'string' ? rawDesc : JSON.stringify(rawDesc));
      const shortDescription = cleanDesc ? (cleanDesc.length > 300 ? cleanDesc.slice(0, 297) + '...' : cleanDesc) : 'No description provided in feed.';

      let pubDate = new Date().toISOString();
      const rawDate = item.pubDate || item.published || item.updated;
      if (rawDate) {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          pubDate = parsedDate.toISOString();
        }
      }

      const author = item['dc:creator'] || item.author?.name || item.author || undefined;
      const tags: string[] = [];
      if (item.category) {
        if (Array.isArray(item.category)) {
          item.category.forEach((c: any) => {
            const val = typeof c === 'string' ? c : c['#text'];
            if (val) tags.push(stripHtml(val));
          });
        } else {
          const val = typeof item.category === 'string' ? item.category : item.category['#text'];
          if (val) tags.push(stripHtml(val));
        }
      }

      // Create article
      db.createArticle({
        headline,
        source: sourceName,
        author: typeof author === 'string' ? stripHtml(author) : undefined,
        canonicalUrl,
        publicationDate: pubDate,
        category,
        tags: tags.slice(0, 5),
        shortDescription,
        fullText: cleanDesc,
        isRead: false,
        isSaved: false,
        isSample: false, // Live ingested article!
      });

      importedCount++;
    }

    db.addIngestionLog({
      providerType: 'rss',
      sourceName,
      sourceUrl: feedUrl,
      status: importedCount > 0 ? 'success' : skippedCount > 0 ? 'success' : 'partial',
      itemsImported: importedCount,
      itemsSkipped: skippedCount,
    });

    return { importedCount, skippedCount, sourceName };
  } catch (err: any) {
    db.addIngestionLog({
      providerType: 'rss',
      sourceName,
      sourceUrl: feedUrl,
      status: 'failed',
      itemsImported: 0,
      itemsSkipped: 0,
      errorMessage: err?.message || 'Network or parse failure',
    });
    throw err;
  }
}

export async function fetchArticleFromUrl(targetUrl: string, category: string = 'Technology'): Promise<Article> {
  const cleanUrl = targetUrl.trim();
  const existing = db.findByCanonicalUrl(cleanUrl);
  if (existing) {
    throw new Error(`Article with canonical URL already exists in library: "${existing.headline}"`);
  }

  const res = await fetch(cleanUrl, {
    headers: {
      'User-Agent': 'IndustryNewsDigestReader/1.0 (Article Metadata Parser)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch article URL (HTTP ${res.status})`);
  }

  const html = await res.text();

  // Extract OpenGraph / Meta tags
  const extractMeta = (property: string): string => {
    const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
                    html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'));
    if (ogMatch && ogMatch[1]) return ogMatch[1].trim();

    const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
                      html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'));
    if (nameMatch && nameMatch[1]) return nameMatch[1].trim();

    return '';
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const rawTitle = extractMeta('og:title') || (titleMatch ? titleMatch[1] : '') || 'Imported News Article';
  const headline = stripHtml(rawTitle);

  const rawDesc = extractMeta('og:description') || extractMeta('description') || '';
  const shortDescription = stripHtml(rawDesc) || 'Imported via URL metadata parser.';

  let source = extractMeta('og:site_name');
  if (!source) {
    try {
      const u = new URL(cleanUrl);
      source = u.hostname.replace(/^www\./, '');
    } catch {
      source = 'Web Ingestion';
    }
  }

  const author = extractMeta('author') || extractMeta('article:author') || undefined;

  const result = db.createArticle({
    headline,
    source,
    author: author ? stripHtml(author) : undefined,
    canonicalUrl: cleanUrl,
    publicationDate: new Date().toISOString(),
    category,
    tags: ['Web Ingestion'],
    shortDescription: shortDescription.length > 300 ? shortDescription.slice(0, 297) + '...' : shortDescription,
    fullText: shortDescription,
    isRead: false,
    isSaved: false,
    isSample: false,
  });

  db.addIngestionLog({
    providerType: 'url',
    sourceName: source,
    sourceUrl: cleanUrl,
    status: 'success',
    itemsImported: 1,
    itemsSkipped: 0,
  });

  return result.article;
}
