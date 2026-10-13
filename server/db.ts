import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Article, Digest, Category, IngestionLog, DashboardStats } from './types.js';

interface DatabaseSchema {
  articles: Article[];
  digests: Digest[];
  categories: Category[];
  ingestionLogs: IngestionLog[];
  preferences: {
    selectedIndustries: string[];
    digestFrequency: string;
    digestLength: string;
    autoMarkReadOnOpen: boolean;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tech',
    name: 'Technology',
    slug: 'technology',
    description: 'Software engineering, cloud infrastructure, hardware, and mobile ecosystems',
    colorHex: '#0284c7',
    isDefault: true,
  },
  {
    id: 'cat-ai',
    name: 'AI & Data',
    slug: 'ai-data',
    description: 'Generative AI, foundation models, machine learning, robotics, and agents',
    colorHex: '#8b5cf6',
    isDefault: true,
  },
  {
    id: 'cat-biz',
    name: 'Business & Markets',
    slug: 'business',
    description: 'Venture funding, macroeconomic shifts, M&A, startups, and enterprise growth',
    colorHex: '#10b981',
    isDefault: true,
  },
  {
    id: 'cat-health',
    name: 'Healthcare & Biotech',
    slug: 'healthcare',
    description: 'Precision medicine, genomics, clinical trials, and healthcare technology',
    colorHex: '#ec4899',
    isDefault: true,
  },
  {
    id: 'cat-energy',
    name: 'Clean Energy & Climate',
    slug: 'energy',
    description: 'Renewable power grids, battery storage, EV infrastructure, and carbon capture',
    colorHex: '#14b8a6',
    isDefault: true,
  },
  {
    id: 'cat-fintech',
    name: 'Fintech & Banking',
    slug: 'fintech',
    description: 'Payment rails, algorithmic trading, digital assets, and regtech',
    colorHex: '#f59e0b',
    isDefault: true,
  },
  {
    id: 'cat-edu',
    name: 'Education & Workforce',
    slug: 'education',
    description: 'Higher education research, digital learning platforms, and skill development',
    colorHex: '#6366f1',
    isDefault: true,
  },
];

const INITIAL_SAMPLE_ARTICLES: Article[] = [
  {
    id: 'art-sample-01',
    headline: 'Next-Generation Reasoning Models Slash Inference Latency for Enterprise Workflows',
    source: 'MIT Technology Review',
    author: 'Elena Vance',
    canonicalUrl: 'https://technologyreview.com/2026/10/reasoning-models-inference-latency-breakthrough',
    publicationDate: '2026-10-12T14:30:00.000Z',
    category: 'AI & Data',
    tags: ['AI Models', 'Inference', 'Enterprise Tech', 'Reasoning'],
    shortDescription: 'Breakthrough algorithmic distillation techniques have reduced cognitive reasoning latency by 64% while maintaining state-of-the-art benchmarks on code and formal verification tasks.',
    fullText: 'Researchers and engineering labs have published results showcasing a novel architectural pipeline for reasoning models. By integrating dynamic speculative drafting with multi-turn self-correction verification during single-pass decoding, teams can deploy deep-thinking agents at a fraction of traditional compute costs. Enterprise adopters in financial risk modeling and automated software verification report a dramatic reduction in wall-clock time for complex queries. The findings suggest that high-capacity reasoning capabilities will soon be viable for real-time customer and developer interfaces without requiring clustered hardware acceleration.',
    isRead: false,
    isSaved: true,
    isSample: true,
    createdAt: '2026-10-12T15:00:00.000Z',
    updatedAt: '2026-10-12T15:00:00.000Z',
  },
  {
    id: 'art-sample-02',
    headline: 'Global Grid Operators Accelerate Multi-Gigawatt Solid-State Battery Deployment',
    source: 'Clean Energy Dispatch',
    author: 'Marcus Lindqvist',
    canonicalUrl: 'https://cleanenergydispatch.org/2026/grid-scale-solid-state-battery-deployments',
    publicationDate: '2026-10-11T18:15:00.000Z',
    category: 'Clean Energy & Climate',
    tags: ['Energy Storage', 'Batteries', 'Renewable Grid', 'Infrastructure'],
    shortDescription: 'Utility-scale pilot installations in three continents have demonstrated 4x energy density over lithium-ion with near-zero thermal runaway degradation over 10,000 continuous discharge cycles.',
    fullText: 'Transmission operators in Northern Europe, California, and South Australia have inaugurated the largest utility-scale solid-state storage facilities to date. The deployments utilize non-flammable ceramic electrolytes capable of operating across extreme temperature variations without external liquid chillers. Early telemetry validates high round-trip efficiency (94%) during rapid peak-shaving events, addressing long-standing intermittency challenges for offshore wind and large-scale solar installations.',
    isRead: false,
    isSaved: false,
    isSample: true,
    createdAt: '2026-10-11T19:00:00.000Z',
    updatedAt: '2026-10-11T19:00:00.000Z',
  },
  {
    id: 'art-sample-03',
    headline: 'SaaS Multi-Tenant Cloud Migration Wave Prioritizes Zero-Trust Isolation Architecture',
    source: 'Cloud Architecture Quarterly',
    author: 'Priya Sharma',
    canonicalUrl: 'https://cloudarchitect.io/articles/2026/zero-trust-multi-tenant-architecture',
    publicationDate: '2026-10-10T11:00:00.000Z',
    category: 'Technology',
    tags: ['Cybersecurity', 'Cloud Computing', 'Zero Trust', 'DevOps'],
    shortDescription: 'Stricter international sovereignty regulations are driving software vendors to replace shared database pools with hardware-isolated micro-tenancy and verifiable cryptographic audit trails.',
    fullText: 'Enterprises across healthcare, banking, and government sectors are mandating verifiable tenant isolation before renewing vendor contracts. In response, infrastructure providers are deploying per-tenant micro-VMs with cryptographically sealed memory enclaves. Software architects note that while cold-start latencies initially posed challenges, modern memory-snapshotting runtimes have driven provisioning down to milliseconds, making dedicated tenant isolation cost-effective even for mid-market SaaS offerings.',
    isRead: true,
    isSaved: true,
    isSample: true,
    createdAt: '2026-10-10T12:00:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  },
  {
    id: 'art-sample-04',
    headline: 'CRISPR-Derived In Vivo Epigenetic Therapy Shows Complete Remission in Phase II Trials',
    source: 'BioTech Industry Monitor',
    author: 'Dr. Arthur Sterling',
    canonicalUrl: 'https://biotechmonitor.net/clinical/in-vivo-epigenetic-editing-phase-2-results',
    publicationDate: '2026-10-09T09:45:00.000Z',
    category: 'Healthcare & Biotech',
    tags: ['Genomics', 'Biotech', 'Clinical Trials', 'Precision Medicine'],
    shortDescription: 'Targeted transcriptional silencing without double-strand DNA breaks demonstrates sustained biomarker normalization across 88 patients with severe congenital lipid disorders.',
    fullText: 'Biopharmaceutical consortiums published landmark clinical results demonstrating the viability of epigenetic editing delivered via lipid nanoparticles. Unlike traditional gene-cutting tools that risk off-target chromosomal translocations, this therapy utilizes dead-Cas9 fused to methyltransferase complexes to silence hyperactive disease-causing alleles. Long-term follow-up confirms stable gene silencing over 18 months following a single intravenous infusion.',
    isRead: false,
    isSaved: false,
    isSample: true,
    createdAt: '2026-10-09T10:30:00.000Z',
    updatedAt: '2026-10-09T10:30:00.000Z',
  },
  {
    id: 'art-sample-05',
    headline: 'Central Banks Harmonize Cross-Border Real-Time Settlement Rails with ISO 20022 Protocols',
    source: 'Financial Intelligence Review',
    author: 'Chen Wei & Sofia Al-Mansoor',
    canonicalUrl: 'https://fintechintelligence.com/2026/cross-border-real-time-settlement-interoperability',
    publicationDate: '2026-10-08T16:20:00.000Z',
    category: 'Fintech & Banking',
    tags: ['Fintech', 'Central Banks', 'Payments', 'Regulation'],
    shortDescription: 'A coalition of 14 central banks has linked domestic instant payment networks, reducing multi-day correspondent banking settlement fees by 78% for international B2B commerce.',
    fullText: 'The Project Nexus initiative has entered production between participating jurisdictions across Southeast Asia, the UK, and the Eurosystem. By standardizing message structures under ISO 20022 and utilizing automated FX auction liquidity pools, transactions clear and settle irrevocably in under 45 seconds. Commercial exporters cite massive working capital improvements as trapped foreign exchange reserves can now be reallocated in real time.',
    isRead: true,
    isSaved: false,
    isSample: true,
    createdAt: '2026-10-08T17:00:00.000Z',
    updatedAt: '2026-10-08T17:00:00.000Z',
  },
  {
    id: 'art-sample-06',
    headline: 'Adaptive Cognitive Tutoring Systems Bridge STEM Achievement Gaps in Multi-District Study',
    source: 'EdTech Horizons',
    author: 'Rachel Morales',
    canonicalUrl: 'https://edtechhorizons.edu/reports/2026/adaptive-cognitive-tutoring-stem-results',
    publicationDate: '2026-10-07T13:00:00.000Z',
    category: 'Education & Workforce',
    tags: ['EdTech', 'Education', 'STEM', 'AI Tutoring'],
    shortDescription: 'A two-year randomized controlled trial spanning 45,000 middle school students found individualized pacing and concept-mapping led to a 1.2 standard deviation gain in mathematical mastery.',
    fullText: 'The Department of Education and educational psychologists have published the outcome of a nationwide pilot evaluating multimodal tutoring agents. Rather than providing direct answers, the systems diagnose root misconceptions in algebraic reasoning and scaffold conversational problem-solving steps. Teachers reported spending 40% more classroom time on high-impact collaborative labs and peer instruction, with the highest gains measured among historically under-resourced districts.',
    isRead: false,
    isSaved: true,
    isSample: true,
    createdAt: '2026-10-07T14:00:00.000Z',
    updatedAt: '2026-10-07T14:00:00.000Z',
  },
  {
    id: 'art-sample-07',
    headline: 'Venture Capital Refocuses on Deep Industrial Automation and Defense Tech Hardware',
    source: 'Venture Pulse Today',
    author: 'Gabriel Stone',
    canonicalUrl: 'https://venturepulse.co/insights/2026/q3-funding-shift-industrial-automation-hardware',
    publicationDate: '2026-10-06T19:40:00.000Z',
    category: 'Business & Markets',
    tags: ['Venture Capital', 'Startups', 'Manufacturing', 'Funding'],
    shortDescription: 'Quarterly funding tallies reveal a 55% surge in seed and Series A rounds for robotics and precision manufacturing, contrasting with a plateau in generic SaaS software valuations.',
    fullText: 'Top-tier venture firms have deployed record capital into foundational robotics, dual-use defense tech, and domestic semiconductor tooling. Institutional LPs are demanding tangible defensive moats and physical supply chain integration over commodity consumer software. Startups building autonomous factory retrofits and specialized automated inspection platforms closed several oversubscribed mega-rounds this quarter.',
    isRead: false,
    isSaved: false,
    isSample: true,
    createdAt: '2026-10-06T20:00:00.000Z',
    updatedAt: '2026-10-06T20:00:00.000Z',
  },
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return {
          articles: Array.isArray(parsed.articles) ? parsed.articles : INITIAL_SAMPLE_ARTICLES,
          digests: Array.isArray(parsed.digests) ? parsed.digests : [],
          categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : INITIAL_CATEGORIES,
          ingestionLogs: Array.isArray(parsed.ingestionLogs) ? parsed.ingestionLogs : [],
          preferences: parsed.preferences || {
            selectedIndustries: ['Technology', 'AI & Data', 'Business & Markets', 'Healthcare & Biotech', 'Clean Energy & Climate', 'Fintech & Banking', 'Education & Workforce'],
            digestFrequency: 'weekly',
            digestLength: 'comprehensive',
            autoMarkReadOnOpen: true,
          },
        };
      }
    } catch (err) {
      console.error('Failed to read database file, initializing default store:', err);
    }

    const initialDb: DatabaseSchema = {
      articles: INITIAL_SAMPLE_ARTICLES,
      digests: [],
      categories: INITIAL_CATEGORIES,
      ingestionLogs: [
        {
          id: 'log-seed-01',
          providerType: 'manual',
          sourceName: 'Curated Intelligence Benchmark Dataset',
          status: 'success',
          itemsImported: INITIAL_SAMPLE_ARTICLES.length,
          itemsSkipped: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      preferences: {
        selectedIndustries: ['Technology', 'AI & Data', 'Business & Markets', 'Healthcare & Biotech', 'Clean Energy & Climate', 'Fintech & Banking', 'Education & Workforce'],
        digestFrequency: 'weekly',
        digestLength: 'comprehensive',
        autoMarkReadOnOpen: true,
      },
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // Articles
  public getArticles(filters?: {
    search?: string;
    category?: string;
    source?: string;
    tag?: string;
    isRead?: boolean;
    isSaved?: boolean;
    dateRange?: 'all' | '24h' | '7d' | '30d';
    sortBy?: 'newest' | 'oldest' | 'relevance';
    page?: number;
    limit?: number;
  }): { articles: Article[]; total: number; page: number; totalPages: number } {
    let result = [...this.data.articles];

    // Filter by search
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.headline.toLowerCase().includes(q) ||
          a.shortDescription.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          (a.fullText && a.fullText.toLowerCase().includes(q)) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (filters?.category && filters.category !== 'all') {
      result = result.filter((a) => a.category.toLowerCase() === filters.category!.toLowerCase());
    }

    // Filter by source
    if (filters?.source && filters.source !== 'all') {
      result = result.filter((a) => a.source.toLowerCase() === filters.source!.toLowerCase());
    }

    // Filter by tag
    if (filters?.tag) {
      result = result.filter((a) => a.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase()));
    }

    // Filter by isRead
    if (filters?.isRead !== undefined) {
      result = result.filter((a) => a.isRead === filters.isRead);
    }

    // Filter by isSaved
    if (filters?.isSaved !== undefined) {
      result = result.filter((a) => a.isSaved === filters.isSaved);
    }

    // Filter by dateRange
    if (filters?.dateRange && filters.dateRange !== 'all') {
      const now = Date.now();
      const cutoffMap: Record<string, number> = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const cutoff = now - (cutoffMap[filters.dateRange] || 0);
      result = result.filter((a) => new Date(a.publicationDate).getTime() >= cutoff);
    }

    // Sort
    if (filters?.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime());
    } else if (filters?.sortBy === 'relevance' && filters.search) {
      const q = filters.search.toLowerCase().trim();
      result.sort((a, b) => {
        const scoreA = (a.headline.toLowerCase().includes(q) ? 5 : 0) + (a.tags.some(t => t.toLowerCase().includes(q)) ? 3 : 0);
        const scoreB = (b.headline.toLowerCase().includes(q) ? 5 : 0) + (b.tags.some(t => t.toLowerCase().includes(q)) ? 3 : 0);
        return scoreB - scoreA;
      });
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
    }

    const total = result.length;
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 20);
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return { articles: paginated, total, page, totalPages };
  }

  public getArticleById(id: string): Article | null {
    return this.data.articles.find((a) => a.id === id) || null;
  }

  public findByCanonicalUrl(url: string): Article | null {
    if (!url) return null;
    const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
    return this.data.articles.find((a) => a.canonicalUrl.trim().toLowerCase().replace(/\/$/, '') === cleanUrl) || null;
  }

  public createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): { article: Article; isDuplicate: boolean } {
    // Duplicate check by canonicalUrl
    if (articleData.canonicalUrl) {
      const existing = this.findByCanonicalUrl(articleData.canonicalUrl);
      if (existing) {
        return { article: existing, isDuplicate: true };
      }
    }

    const now = new Date().toISOString();
    const newArticle: Article = {
      ...articleData,
      id: crypto.randomUUID(),
      tags: Array.isArray(articleData.tags) ? articleData.tags : [],
      isRead: !!articleData.isRead,
      isSaved: !!articleData.isSaved,
      isSample: !!articleData.isSample,
      createdAt: now,
      updatedAt: now,
    };

    this.data.articles.unshift(newArticle);
    this.saveDatabase();
    return { article: newArticle, isDuplicate: false };
  }

  public updateArticle(id: string, updates: Partial<Article>): Article | null {
    const idx = this.data.articles.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const existing = this.data.articles[idx];
    const updated: Article = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      updatedAt: new Date().toISOString(),
    };

    this.data.articles[idx] = updated;
    this.saveDatabase();
    return updated;
  }

  public deleteArticle(id: string): boolean {
    const initialLen = this.data.articles.length;
    this.data.articles = this.data.articles.filter((a) => a.id !== id);
    if (this.data.articles.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public toggleRead(id: string): Article | null {
    const art = this.getArticleById(id);
    if (!art) return null;
    return this.updateArticle(id, { isRead: !art.isRead });
  }

  public toggleSaved(id: string): Article | null {
    const art = this.getArticleById(id);
    if (!art) return null;
    return this.updateArticle(id, { isSaved: !art.isSaved });
  }

  // Digests
  public getDigests(): Digest[] {
    return [...this.data.digests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getDigestById(id: string): Digest | null {
    return this.data.digests.find((d) => d.id === id) || null;
  }

  public saveDigest(digest: Digest): Digest {
    // If exists update, else unshift
    const idx = this.data.digests.findIndex((d) => d.id === digest.id);
    if (idx !== -1) {
      this.data.digests[idx] = digest;
    } else {
      this.data.digests.unshift(digest);
    }
    this.saveDatabase();
    return digest;
  }

  public deleteDigest(id: string): boolean {
    const initialLen = this.data.digests.length;
    this.data.digests = this.data.digests.filter((d) => d.id !== id);
    if (this.data.digests.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): Category[] {
    return [...this.data.categories];
  }

  public addCategory(cat: Omit<Category, 'id' | 'isDefault'>): Category {
    const id = `cat-${crypto.randomUUID().slice(0, 8)}`;
    const newCategory: Category = {
      ...cat,
      id,
      isDefault: false,
    };
    this.data.categories.push(newCategory);
    this.saveDatabase();
    return newCategory;
  }

  // Ingestion Logs
  public getIngestionLogs(): IngestionLog[] {
    return [...this.data.ingestionLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addIngestionLog(log: Omit<IngestionLog, 'id' | 'createdAt'>): IngestionLog {
    const newLog: IngestionLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.ingestionLogs.unshift(newLog);
    // Keep last 50 logs
    if (this.data.ingestionLogs.length > 50) {
      this.data.ingestionLogs = this.data.ingestionLogs.slice(0, 50);
    }
    this.saveDatabase();
    return newLog;
  }

  // Preferences
  public getPreferences() {
    return { ...this.data.preferences };
  }

  public updatePreferences(prefs: Partial<DatabaseSchema['preferences']>) {
    this.data.preferences = { ...this.data.preferences, ...prefs };
    this.saveDatabase();
    return this.data.preferences;
  }

  // Stats
  public getDashboardStats(): DashboardStats {
    const total = this.data.articles.length;
    const unread = this.data.articles.filter((a) => !a.isRead).length;
    const saved = this.data.articles.filter((a) => a.isSaved).length;
    const digestsCount = this.data.digests.length;

    // Sources count
    const uniqueSources = new Set(this.data.articles.map((a) => a.source.trim()));

    // Category distribution
    const catCounts = new Map<string, number>();
    this.data.articles.forEach((a) => {
      catCounts.set(a.category, (catCounts.get(a.category) || 0) + 1);
    });

    const categoryMap = new Map(this.data.categories.map((c) => [c.name, c.colorHex]));

    const categoryDistribution = Array.from(catCounts.entries()).map(([catName, count]) => ({
      category: catName,
      count,
      colorHex: categoryMap.get(catName) || '#64748b',
    })).sort((a, b) => b.count - a.count);

    return {
      totalArticles: total,
      unreadArticles: unread,
      savedArticles: saved,
      digestsCount,
      categoryDistribution,
      sourcesCount: uniqueSources.size,
      latestIngestion: this.data.ingestionLogs[0],
    };
  }

  public resetToSampleData(): void {
    this.data.articles = [...INITIAL_SAMPLE_ARTICLES];
    this.data.digests = [];
    this.data.ingestionLogs = [
      {
        id: crypto.randomUUID(),
        providerType: 'manual',
        sourceName: 'Sample Intelligence Dataset Reset',
        status: 'success',
        itemsImported: INITIAL_SAMPLE_ARTICLES.length,
        itemsSkipped: 0,
        createdAt: new Date().toISOString(),
      },
    ];
    this.saveDatabase();
  }
}

export const db = new DatabaseService();
