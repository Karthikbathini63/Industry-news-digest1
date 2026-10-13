import React from 'react';
import {
  FileText,
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Rss,
  CheckCircle,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { DashboardStats, Digest, Article, Category, ViewTab } from '../types.js';

interface DashboardProps {
  stats: DashboardStats | null;
  recentDigests: Digest[];
  recentArticles: Article[];
  categories: Category[];
  onSelectTab: (tab: ViewTab) => void;
  onOpenArticle: (article: Article) => void;
  onOpenDigest: (digest: Digest) => void;
  onQuickSyncFeed: (feedUrl: string) => void;
  onFilterByCategory: (categoryName: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  recentDigests,
  recentArticles,
  categories,
  onSelectTab,
  onOpenArticle,
  onOpenDigest,
  onQuickSyncFeed,
  onFilterByCategory,
}) => {
  const total = stats?.totalArticles || 0;
  const unread = stats?.unreadArticles || 0;
  const saved = stats?.savedArticles || 0;
  const digestsCount = stats?.digestsCount || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/80 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-semibold mb-3">
            <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
            <span>Continuous Editorial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-2">
            Stay Ahead of Critical Industry Shifts
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Centralize your multi-source news ingestion, synthesize developments into verified AI-grounded executive digests, and export research briefings with verifiable source citations.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onSelectTab('studio')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate New Executive Digest</span>
            </button>
            <button
              onClick={() => onSelectTab('library')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Explore Library ({total})</span>
            </button>
            <button
              onClick={() => onSelectTab('ingestion')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm transition-all cursor-pointer"
            >
              <Rss className="w-4 h-4 text-cyan-400" />
              <span>Syndication Feeds</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div
          onClick={() => onSelectTab('library')}
          className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Articles
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-950/40 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {total}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Across {stats?.sourcesCount || 0} unique publications</span>
          </p>
        </div>

        {/* Unread Queue */}
        <div
          onClick={() => onSelectTab('library')}
          className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Unread Queue
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 group-hover:bg-indigo-950/40 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-300 tracking-tight">
            {unread}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {unread === 0 ? 'All caught up' : 'Awaiting executive review'}
          </p>
        </div>

        {/* Saved & Starred */}
        <div
          onClick={() => onSelectTab('library')}
          className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saved Research
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-950/40 transition-colors">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-tight">
            {saved}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bookmarked for long-term reference
          </p>
        </div>

        {/* Generated Digests */}
        <div
          onClick={() => onSelectTab('history')}
          className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Executive Digests
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-tight">
            {digestsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            AI & analytical reports archived
          </p>
        </div>
      </div>

      {/* Main Grid: Sector Breakdown + Recent Digests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sector Distribution Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Sector Distribution</span>
              </h2>
              <span className="text-xs text-slate-400">Total: {total}</span>
            </div>

            {/* Visual Distribution Bar */}
            {stats?.categoryDistribution && stats.categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800">
                  {stats.categoryDistribution.map((item, idx) => {
                    const percent = total > 0 ? (item.count / total) * 100 : 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${percent}%`,
                          backgroundColor: item.colorHex || '#3b82f6',
                        }}
                        title={`${item.category}: ${item.count} articles (${percent.toFixed(1)}%)`}
                        className="h-full transition-all hover:opacity-80 cursor-pointer"
                        onClick={() => onFilterByCategory(item.category)}
                      />
                    );
                  })}
                </div>

                {/* Legend & Count Breakdown */}
                <div className="space-y-2.5 pt-2">
                  {stats.categoryDistribution.map((cat, idx) => (
                    <div
                      key={idx}
                      onClick={() => onFilterByCategory(cat.category)}
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.colorHex }}
                        />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors font-medium">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-slate-400">
                        <span>{cat.count}</span>
                        <span className="text-[10px] text-slate-500">
                          ({total > 0 ? Math.round((cat.count / total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No articles available yet.</p>
            )}
          </div>

          {/* Quick Real Feed Sync Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Rss className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Feed Sources</span>
              </h3>
              <button
                onClick={() => onSelectTab('ingestion')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                Manage Feeds
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Fetch latest real industry dispatches from open RSS publications with automatic deduplication.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onQuickSyncFeed('https://news.ycombinator.com/rss')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between text-xs text-slate-300 group cursor-pointer"
              >
                <div>
                  <span className="font-semibold block text-slate-200 group-hover:text-cyan-300">
                    Hacker News
                  </span>
                  <span className="text-[11px] text-slate-500">Technology & Startups</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => onQuickSyncFeed('https://rss.arxiv.org/rss/cs.AI')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between text-xs text-slate-300 group cursor-pointer"
              >
                <div>
                  <span className="font-semibold block text-slate-200 group-hover:text-cyan-300">
                    arXiv AI & ML
                  </span>
                  <span className="text-[11px] text-slate-500">Computer Science Preprints</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Digests & Latest Feed Dispatches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Executive Digests */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Recent Executive Digests</span>
              </h2>
              {recentDigests.length > 0 && (
                <button
                  onClick={() => onSelectTab('history')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>View All ({recentDigests.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {recentDigests.length > 0 ? (
              <div className="space-y-3">
                {recentDigests.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onOpenDigest(d)}
                    className="p-4 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {d.title}
                      </h3>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 border border-slate-700">
                        {d.lengthType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {d.overview}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <span>Horizon: {d.dateRangeLabel}</span>
                        <span>•</span>
                        <span>{d.referencedArticles?.length || d.sourceArticleIds.length} sources cited</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/60">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-300">No Digests Generated Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Select key articles or industries and generate your first Gemini-synthesized executive briefing.
                </p>
                <button
                  onClick={() => onSelectTab('studio')}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  Generate First Digest
                </button>
              </div>
            )}
          </div>

          {/* Latest Dispatches Feed */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Latest Industry Dispatches</span>
              </h2>
              <button
                onClick={() => onSelectTab('library')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View Full Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {recentArticles.slice(0, 5).map((art) => (
                <div
                  key={art.id}
                  onClick={() => onOpenArticle(art)}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-800/20 px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {art.category}
                      </span>
                      <span className="text-xs font-medium text-slate-400">{art.source}</span>
                      {art.isSample && (
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-500">
                          Sample
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {art.headline}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {art.shortDescription}
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0 mt-1 font-mono">
                    {new Date(art.publicationDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
