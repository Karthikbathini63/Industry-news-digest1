export interface Article {
  id: string;
  headline: string;
  source: string;
  author?: string;
  canonicalUrl: string;
  publicationDate: string;
  category: string;
  tags: string[];
  shortDescription: string;
  fullText: string;
  isRead: boolean;
  isSaved: boolean;
  isSample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KeyDevelopment {
  title: string;
  summary: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  sourceArticleIds: string[];
}

export interface Takeaway {
  point: string;
  significance: string;
  sourceArticleIds: string[];
}

export interface EmergingTheme {
  theme: string;
  description: string;
  prevalence: string;
}

export interface PotentialImplication {
  sectorOrDomain: string;
  implication: string;
  timeframe: string;
}

export interface ReferencedArticle {
  articleId: string;
  headline: string;
  source: string;
  citationRole: string;
}

export interface Digest {
  id: string;
  title: string;
  dateRangeLabel: string;
  lengthType: 'brief' | 'comprehensive' | 'strategic';
  focusTopic?: string;
  overview: string;
  keyDevelopments: KeyDevelopment[];
  takeaways: Takeaway[];
  emergingThemes: EmergingTheme[];
  potentialImplications: PotentialImplication[];
  referencedArticles: ReferencedArticle[];
  sourceArticleIds: string[];
  selectedCategories: string[];
  aiModelName: string;
  createdAt: string;
  sourceAvailability?: { id: string; exists: boolean }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  colorHex: string;
  isDefault: boolean;
}

export interface IngestionLog {
  id: string;
  providerType: 'rss' | 'url' | 'manual';
  sourceName: string;
  sourceUrl?: string;
  status: 'success' | 'failed' | 'partial';
  itemsImported: number;
  itemsSkipped: number;
  errorMessage?: string;
  createdAt: string;
}

export interface VettedRssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
}

export interface DashboardStats {
  totalArticles: number;
  unreadArticles: number;
  savedArticles: number;
  digestsCount: number;
  categoryDistribution: { category: string; count: number; colorHex: string }[];
  sourcesCount: number;
  latestIngestion?: IngestionLog;
}

export interface SystemStatus {
  geminiConfigured: boolean;
  aiModel: string;
  dbReady: boolean;
  feedCount: number;
  timestamp: string;
}

export type ViewTab = 'dashboard' | 'library' | 'studio' | 'history' | 'ingestion' | 'settings';
