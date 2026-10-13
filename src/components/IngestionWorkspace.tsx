import React, { useState } from 'react';
import {
  Rss,
  Globe,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { VettedRssFeed, IngestionLog, Category } from '../types.js';

interface IngestionWorkspaceProps {
  vettedFeeds: VettedRssFeed[];
  logs: IngestionLog[];
  categories: Category[];
  onSyncRss: (url: string, category?: string, sourceName?: string) => Promise<{ importedCount: number; skippedCount: number; message: string }>;
  onIngestUrl: (url: string, category?: string) => Promise<any>;
  onRefreshLogs: () => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const IngestionWorkspace: React.FC<IngestionWorkspaceProps> = ({
  vettedFeeds,
  logs,
  categories,
  onSyncRss,
  onIngestUrl,
  onRefreshLogs,
  onNotify,
}) => {
  const [syncingFeedId, setSyncingFeedId] = useState<string | null>(null);
  const [customRssUrl, setCustomRssUrl] = useState('');
  const [customRssCategory, setCustomRssCategory] = useState(categories[0]?.name || 'Technology');
  const [customRssName, setCustomRssName] = useState('');
  const [isSubmittingCustomRss, setIsSubmittingCustomRss] = useState(false);

  const [webUrl, setWebUrl] = useState('');
  const [webCategory, setWebCategory] = useState(categories[0]?.name || 'Technology');
  const [isSubmittingWebUrl, setIsSubmittingWebUrl] = useState(false);

  const handleSyncVetted = async (feed: VettedRssFeed) => {
    setSyncingFeedId(feed.id);
    try {
      const res = await onSyncRss(feed.url, feed.category, feed.name);
      onNotify('success', `Synced ${feed.name}`, res.message);
      onRefreshLogs();
    } catch (err: any) {
      onNotify('error', `Failed to sync ${feed.name}`, err?.message);
    } finally {
      setSyncingFeedId(null);
    }
  };

  const handleCustomRssSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRssUrl.trim()) return;

    setIsSubmittingCustomRss(true);
    try {
      const res = await onSyncRss(customRssUrl.trim(), customRssCategory, customRssName.trim() || undefined);
      onNotify('success', 'Custom Feed Ingested', res.message);
      setCustomRssUrl('');
      setCustomRssName('');
      onRefreshLogs();
    } catch (err: any) {
      onNotify('error', 'Feed Ingestion Error', err?.message);
    } finally {
      setIsSubmittingCustomRss(false);
    }
  };

  const handleWebUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim()) return;

    setIsSubmittingWebUrl(true);
    try {
      const res = await onIngestUrl(webUrl.trim(), webCategory);
      onNotify('success', 'Article Metadata Imported', `Extracted "${res.article?.headline || 'Article'}"`);
      setWebUrl('');
      onRefreshLogs();
    } catch (err: any) {
      onNotify('error', 'URL Ingestion Error', err?.message);
    } finally {
      setIsSubmittingWebUrl(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Rss className="w-6 h-6 text-cyan-400" />
          <span>Real News Syndication & Ingestion</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Ingest legitimate, public RSS feeds or user-submitted article URLs with automatic canonical URL deduplication.
        </p>
      </div>

      {/* Vetted Public Feeds Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Vetted Open Industry Feeds</span>
          </h2>
          <span className="text-xs text-slate-400">Publicly syndicated news sources</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vettedFeeds.map((feed) => {
            const isSyncing = syncingFeedId === feed.id;
            return (
              <div
                key={feed.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {feed.category}
                    </span>
                    <a
                      href={feed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title="Open raw XML feed"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{feed.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feed.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                    {feed.url}
                  </span>
                  <button
                    onClick={() => handleSyncVetted(feed)}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Feed'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Ingestion Panels (2 Columns: Custom RSS + Web Article URL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Custom Public RSS / Atom Feed */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Rss className="w-4 h-4 text-cyan-400" />
            <span>Import Custom RSS / Atom Feed</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Provide any valid public RSS 2.0 or Atom XML feed URL. The ingestion parser extracts stories and prevents duplicates.
          </p>

          <form onSubmit={handleCustomRssSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Feed XML URL <span className="text-cyan-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/feed.xml"
                value={customRssUrl}
                onChange={(e) => setCustomRssUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Sector
                </label>
                <select
                  value={customRssCategory}
                  onChange={(e) => setCustomRssCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Feed Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tech Dispatch"
                  value={customRssName}
                  onChange={(e) => setCustomRssName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingCustomRss}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold shadow-md transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingCustomRss ? 'animate-spin' : ''}`} />
              <span>{isSubmittingCustomRss ? 'Parsing Feed...' : 'Ingest RSS Feed'}</span>
            </button>
          </form>
        </div>

        {/* Panel 2: Article URL Metadata Parser */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Web Article URL Metadata Extractor</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Submit a direct article link. The server securely extracts OpenGraph metadata (headline, summary, author, source) and indexes it.
          </p>

          <form onSubmit={handleWebUrlSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Article Web URL <span className="text-indigo-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://news.ycombinator.com/item?id=..."
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Assign Category
              </label>
              <select
                value={webCategory}
                onChange={(e) => setWebCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmittingWebUrl}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Plus className={`w-3.5 h-3.5 ${isSubmittingWebUrl ? 'animate-spin' : ''}`} />
              <span>{isSubmittingWebUrl ? 'Extracting Metadata...' : 'Extract & Save Article'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Ingestion Audit Logs Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Ingestion Audit Log ({logs.length})</span>
          </h2>
          <button
            onClick={onRefreshLogs}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            Refresh Logs
          </button>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Source Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Imported</th>
                  <th className="py-2.5 px-3">Skipped</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 uppercase font-mono text-[10px] text-slate-400">
                      {log.providerType}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {log.sourceName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800/80'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">
                      +{log.itemsImported}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {log.itemsSkipped}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">No ingestion runs logged yet.</p>
        )}
      </div>
    </div>
  );
};
