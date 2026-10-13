import {
  Article,
  Digest,
  Category,
  IngestionLog,
  VettedRssFeed,
  DashboardStats,
  SystemStatus,
} from './types.js';

export const api = {
  // Status & Stats
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Failed to retrieve system status');
    return res.json();
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to retrieve stats');
    return res.json();
  },

  // Articles
  async getArticles(params?: {
    search?: string;
    category?: string;
    source?: string;
    tag?: string;
    isRead?: boolean;
    isSaved?: boolean;
    dateRange?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: Article[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.set('search', params.search);
      if (params.category && params.category !== 'all') query.set('category', params.category);
      if (params.source && params.source !== 'all') query.set('source', params.source);
      if (params.tag) query.set('tag', params.tag);
      if (params.isRead !== undefined) query.set('isRead', String(params.isRead));
      if (params.isSaved !== undefined) query.set('isSaved', String(params.isSaved));
      if (params.dateRange && params.dateRange !== 'all') query.set('dateRange', params.dateRange);
      if (params.sortBy) query.set('sortBy', params.sortBy);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
    }

    const res = await fetch(`/api/articles?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticle(id: string): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`);
    if (!res.ok) throw new Error('Article not found');
    return res.json();
  },

  async createArticle(data: Partial<Article>): Promise<Article> {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create article');
    }
    return json;
  },

  async updateArticle(id: string, data: Partial<Article>): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update article');
    return json;
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete article');
  },

  async toggleRead(id: string): Promise<Article> {
    const res = await fetch(`/api/articles/${id}/toggle-read`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle read status');
    return res.json();
  },

  async toggleSaved(id: string): Promise<Article> {
    const res = await fetch(`/api/articles/${id}/toggle-save`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle saved status');
    return res.json();
  },

  // Digests
  async generateDigest(params: {
    articleIds?: string[];
    categories?: string[];
    dateRange?: string;
    lengthType?: string;
    focusTopic?: string;
  }): Promise<Digest> {
    const res = await fetch('/api/digests/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to generate digest');
    }
    return json;
  },

  async getDigests(): Promise<Digest[]> {
    const res = await fetch('/api/digests');
    if (!res.ok) throw new Error('Failed to fetch digests');
    return res.json();
  },

  async getDigest(id: string): Promise<Digest> {
    const res = await fetch(`/api/digests/${id}`);
    if (!res.ok) throw new Error('Digest not found');
    return res.json();
  },

  async deleteDigest(id: string): Promise<void> {
    const res = await fetch(`/api/digests/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete digest');
  },

  // Ingestion
  async getVettedFeeds(): Promise<VettedRssFeed[]> {
    const res = await fetch('/api/ingest/vetted-feeds');
    if (!res.ok) throw new Error('Failed to fetch vetted feeds');
    return res.json();
  },

  async ingestRss(params: { url: string; category?: string; sourceName?: string }): Promise<{
    importedCount: number;
    skippedCount: number;
    sourceName: string;
    message: string;
  }> {
    const res = await fetch('/api/ingest/rss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to ingest RSS feed');
    return json;
  },

  async ingestUrl(params: { url: string; category?: string }): Promise<{ article: Article; message: string }> {
    const res = await fetch('/api/ingest/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to ingest URL');
    return json;
  },

  async getIngestionLogs(): Promise<IngestionLog[]> {
    const res = await fetch('/api/ingest/logs');
    if (!res.ok) throw new Error('Failed to fetch ingestion logs');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(params: { name: string; description?: string; colorHex?: string }): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create category');
    return json;
  },

  // Preferences & Demo
  async getPreferences(): Promise<any> {
    const res = await fetch('/api/preferences');
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return res.json();
  },

  async updatePreferences(data: any): Promise<any> {
    const res = await fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  },

  async resetDemo(): Promise<void> {
    const res = await fetch('/api/reset-demo', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset sample dataset');
  },
};
