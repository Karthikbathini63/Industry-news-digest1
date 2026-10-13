import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { generateDigestWithGemini, isGeminiConfigured } from './gemini.js';
import { ingestRssFeed, fetchArticleFromUrl, VETTED_FEEDS } from './ingestion.js';
import { Article } from './types.js';

export const apiRouter = Router();

// Helper to escape CSV values safely and prevent formula injection
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Neutralize spreadsheet formula injection (=, +, -, @)
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// ----------------------------------------------------
// SYSTEM STATUS
// ----------------------------------------------------
apiRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    geminiConfigured: isGeminiConfigured(),
    aiModel: 'gemini-3.8-flash',
    dbReady: true,
    feedCount: VETTED_FEEDS.length,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to calculate stats' });
  }
});

// ----------------------------------------------------
// ARTICLES
// ----------------------------------------------------
apiRouter.get('/articles', (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      source,
      tag,
      isRead,
      isSaved,
      dateRange,
      sortBy,
      page,
      limit,
    } = req.query;

    const filters: any = {};
    if (typeof search === 'string') filters.search = search;
    if (typeof category === 'string') filters.category = category;
    if (typeof source === 'string') filters.source = source;
    if (typeof tag === 'string') filters.tag = tag;
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (isSaved !== undefined) filters.isSaved = isSaved === 'true';
    if (typeof dateRange === 'string') filters.dateRange = dateRange;
    if (typeof sortBy === 'string') filters.sortBy = sortBy;
    if (page) filters.page = parseInt(String(page), 10);
    if (limit) filters.limit = parseInt(String(limit), 10);

    const result = db.getArticles(filters);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to retrieve articles' });
  }
});

apiRouter.get('/articles/:id', (req: Request, res: Response) => {
  const article = db.getArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

apiRouter.post('/articles', (req: Request, res: Response) => {
  try {
    const {
      headline,
      source,
      author,
      canonicalUrl,
      publicationDate,
      category,
      tags,
      shortDescription,
      fullText,
    } = req.body;

    if (!headline || !headline.trim()) {
      return res.status(400).json({ error: 'Headline is required' });
    }
    if (!source || !source.trim()) {
      return res.status(400).json({ error: 'Source is required' });
    }
    if (!canonicalUrl || !canonicalUrl.trim()) {
      return res.status(400).json({ error: 'Canonical URL is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // URL validation
    try {
      new URL(canonicalUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid canonical URL format' });
    }

    const { article, isDuplicate } = db.createArticle({
      headline: headline.trim(),
      source: source.trim(),
      author: author?.trim() || undefined,
      canonicalUrl: canonicalUrl.trim(),
      publicationDate: publicationDate || new Date().toISOString(),
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : [],
      shortDescription: (shortDescription || headline).trim(),
      fullText: (fullText || shortDescription || headline).trim(),
      isRead: false,
      isSaved: false,
      isSample: false,
    });

    if (isDuplicate) {
      return res.status(409).json({
        error: 'An article with this canonical URL already exists in the library.',
        article,
      });
    }

    res.status(201).json(article);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create article' });
  }
});

apiRouter.put('/articles/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateArticle(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update article' });
  }
});

apiRouter.delete('/articles/:id', (req: Request, res: Response) => {
  const success = db.deleteArticle(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json({ success: true, message: 'Article deleted successfully' });
});

apiRouter.post('/articles/:id/toggle-read', (req: Request, res: Response) => {
  const updated = db.toggleRead(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(updated);
});

apiRouter.post('/articles/:id/toggle-save', (req: Request, res: Response) => {
  const updated = db.toggleSaved(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(updated);
});

// ----------------------------------------------------
// INGESTION
// ----------------------------------------------------
apiRouter.get('/ingest/vetted-feeds', (req: Request, res: Response) => {
  res.json(VETTED_FEEDS);
});

apiRouter.post('/ingest/rss', async (req: Request, res: Response) => {
  try {
    const { url, category, sourceName } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'Feed URL is required' });
    }

    const result = await ingestRssFeed(url.trim(), category, sourceName);
    res.json({
      success: true,
      message: `Ingested ${result.importedCount} new article(s) (${result.skippedCount} duplicates skipped) from ${result.sourceName}.`,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to ingest RSS feed' });
  }
});

apiRouter.post('/ingest/url', async (req: Request, res: Response) => {
  try {
    const { url, category } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'Article URL is required' });
    }

    const article = await fetchArticleFromUrl(url.trim(), category);
    res.status(201).json({
      success: true,
      message: `Successfully extracted article metadata from ${article.source}`,
      article,
    });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to fetch article from URL' });
  }
});

apiRouter.get('/ingest/logs', (req: Request, res: Response) => {
  res.json(db.getIngestionLogs());
});

// ----------------------------------------------------
// AI DIGEST GENERATION & HISTORY
// ----------------------------------------------------
apiRouter.post('/digests/generate', async (req: Request, res: Response) => {
  try {
    const { articleIds, categories, dateRange, lengthType, focusTopic } = req.body;

    let targetArticles: Article[] = [];

    // If specific article IDs provided, fetch them
    if (Array.isArray(articleIds) && articleIds.length > 0) {
      targetArticles = articleIds
        .map((id: string) => db.getArticleById(id))
        .filter((a): a is Article => a !== null);
    } else {
      // Fetch based on filters
      const filterResult = db.getArticles({
        category: categories && categories.length === 1 ? categories[0] : undefined,
        dateRange: dateRange || 'all',
        limit: 15, // Keep within high-signal context
      });
      targetArticles = filterResult.articles;
      if (categories && categories.length > 1) {
        targetArticles = targetArticles.filter((a) => categories.includes(a.category));
      }
    }

    if (targetArticles.length === 0) {
      return res.status(400).json({
        error: 'No articles match the selected criteria for digest generation. Please broaden filters or select articles.',
      });
    }

    const dateRangeLabel = dateRange === '24h' ? 'Past 24 Hours' : dateRange === '7d' ? 'Past 7 Days' : dateRange === '30d' ? 'Past 30 Days' : 'All Recorded Time';
    const selectedCats = categories && categories.length > 0
      ? categories
      : Array.from(new Set(targetArticles.map((a) => a.category)));

    const digest = await generateDigestWithGemini({
      articles: targetArticles,
      dateRangeLabel,
      lengthType: lengthType || 'comprehensive',
      focusTopic: focusTopic?.trim() || undefined,
      selectedCategories: selectedCats,
    });

    // Save to persistent database
    db.saveDigest(digest);

    res.status(201).json(digest);
  } catch (err: any) {
    console.error('Digest generation endpoint error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate digest' });
  }
});

apiRouter.get('/digests', (req: Request, res: Response) => {
  res.json(db.getDigests());
});

apiRouter.get('/digests/:id', (req: Request, res: Response) => {
  const digest = db.getDigestById(req.params.id);
  if (!digest) {
    return res.status(404).json({ error: 'Digest not found' });
  }

  // Check which source articles still exist in the database
  const availability = digest.sourceArticleIds.map((id) => ({
    id,
    exists: db.getArticleById(id) !== null,
  }));

  res.json({
    ...digest,
    sourceAvailability: availability,
  });
});

apiRouter.delete('/digests/:id', (req: Request, res: Response) => {
  const success = db.deleteDigest(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Digest not found' });
  }
  res.json({ success: true, message: 'Digest deleted successfully' });
});

// ----------------------------------------------------
// CATEGORIES & PREFERENCES
// ----------------------------------------------------
apiRouter.get('/categories', (req: Request, res: Response) => {
  res.json(db.getCategories());
});

apiRouter.post('/categories', (req: Request, res: Response) => {
  try {
    const { name, description, colorHex } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory = db.addCategory({
      name: name.trim(),
      slug,
      description: (description || '').trim(),
      colorHex: colorHex || '#3b82f6',
    });
    res.status(201).json(newCategory);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to add category' });
  }
});

apiRouter.get('/preferences', (req: Request, res: Response) => {
  res.json(db.getPreferences());
});

apiRouter.put('/preferences', (req: Request, res: Response) => {
  const updated = db.updatePreferences(req.body);
  res.json(updated);
});

apiRouter.post('/reset-demo', (req: Request, res: Response) => {
  db.resetToSampleData();
  res.json({ success: true, message: 'Database reset to benchmark sample dataset' });
});

// ----------------------------------------------------
// CSV EXPORT ENDPOINTS
// ----------------------------------------------------
apiRouter.get('/export/articles.csv', (req: Request, res: Response) => {
  try {
    const { category, isSaved, isRead, search } = req.query;
    const filterResult = db.getArticles({
      category: typeof category === 'string' ? category : undefined,
      isSaved: isSaved !== undefined ? isSaved === 'true' : undefined,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      search: typeof search === 'string' ? search : undefined,
      limit: 1000,
    });

    const headers = ['Headline', 'Source', 'Author', 'Publication Date', 'Category', 'Tags', 'Read Status', 'Saved Status', 'Canonical URL', 'Short Description'];
    const rows = filterResult.articles.map((a) => [
      escapeCsv(a.headline),
      escapeCsv(a.source),
      escapeCsv(a.author || ''),
      escapeCsv(a.publicationDate),
      escapeCsv(a.category),
      escapeCsv(a.tags.join(', ')),
      escapeCsv(a.isRead ? 'Read' : 'Unread'),
      escapeCsv(a.isSaved ? 'Saved' : 'Not Saved'),
      escapeCsv(a.canonicalUrl),
      escapeCsv(a.shortDescription),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="industry-news-articles-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to export articles' });
  }
});

apiRouter.get('/export/digests/:id.csv', (req: Request, res: Response) => {
  try {
    const digest = db.getDigestById(req.params.id);
    if (!digest) {
      return res.status(404).json({ error: 'Digest not found' });
    }

    const lines: string[] = [];
    lines.push(`"Report Title",${escapeCsv(digest.title)}`);
    lines.push(`"Generated Date",${escapeCsv(digest.createdAt)}`);
    lines.push(`"Time Horizon",${escapeCsv(digest.dateRangeLabel)}`);
    lines.push(`"Scope",${escapeCsv(digest.lengthType)}`);
    lines.push(`"AI Model",${escapeCsv(digest.aiModelName)}`);
    lines.push(`"Executive Overview",${escapeCsv(digest.overview)}`);
    lines.push('');

    lines.push('"SECTION: KEY DEVELOPMENTS"');
    lines.push('"Title","Impact Level","Summary","Cited Article IDs"');
    digest.keyDevelopments.forEach((kd) => {
      lines.push([
        escapeCsv(kd.title),
        escapeCsv(kd.impactLevel),
        escapeCsv(kd.summary),
        escapeCsv(kd.sourceArticleIds.join('; ')),
      ].join(','));
    });
    lines.push('');

    lines.push('"SECTION: STRATEGIC TAKEAWAYS"');
    lines.push('"Takeaway Point","Significance","Cited Article IDs"');
    digest.takeaways.forEach((t) => {
      lines.push([
        escapeCsv(t.point),
        escapeCsv(t.significance),
        escapeCsv(t.sourceArticleIds.join('; ')),
      ].join(','));
    });
    lines.push('');

    lines.push('"SECTION: EMERGING THEMES"');
    lines.push('"Theme","Description","Prevalence"');
    digest.emergingThemes.forEach((et) => {
      lines.push([
        escapeCsv(et.theme),
        escapeCsv(et.description),
        escapeCsv(et.prevalence),
      ].join(','));
    });
    lines.push('');

    lines.push('"SECTION: REFERENCED SOURCE ARTICLES"');
    lines.push('"Article ID","Headline","Source","Role"');
    digest.referencedArticles.forEach((ra) => {
      lines.push([
        escapeCsv(ra.articleId),
        escapeCsv(ra.headline),
        escapeCsv(ra.source),
        escapeCsv(ra.citationRole),
      ].join(','));
    });

    const csvContent = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="digest-${digest.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to export digest' });
  }
});
