import React, { useState } from 'react';
import {
  History,
  Sparkles,
  Download,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Digest, Article } from '../types.js';

interface DigestHistoryProps {
  digests: Digest[];
  allArticles: Article[];
  onOpenDigest: (digest: Digest) => void;
  onDeleteDigest: (id: string) => Promise<void>;
  onRegenerateDigest: (digest: Digest) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DigestHistory: React.FC<DigestHistoryProps> = ({
  digests,
  allArticles,
  onOpenDigest,
  onDeleteDigest,
  onRegenerateDigest,
  onNotify,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await onDeleteDigest(id);
      setDeleteConfirmId(null);
      onNotify('success', 'Digest deleted from history');
    } catch (err: any) {
      onNotify('error', 'Failed to delete digest', err?.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Executive Digest Archive</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit, revisit, export, or re-run historical intelligence briefings.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          {digests.length} Saved Briefings
        </span>
      </div>

      {digests.length > 0 ? (
        <div className="space-y-4">
          {digests.map((digest) => {
            // Check availability of source articles
            const availableSources = digest.sourceArticleIds.filter((id) =>
              allArticles.some((a) => a.id === id)
            );
            const missingCount = digest.sourceArticleIds.length - availableSources.length;

            return (
              <div
                key={digest.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {digest.lengthType}
                      </span>
                      <span className="text-slate-400">Horizon: {digest.dateRangeLabel}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-slate-500">
                        {new Date(digest.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <h2
                      onClick={() => onOpenDigest(digest)}
                      className="text-base sm:text-lg font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {digest.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onOpenDigest(digest)}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Briefing</span>
                    </button>

                    <a
                      href={`/api/export/digests/${digest.id}.csv`}
                      download
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Export to CSV"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onRegenerateDigest(digest)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Re-generate this digest using recorded sources"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(digest.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Delete Digest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Overview preview */}
                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {digest.overview}
                </p>

                {/* Metadata strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center gap-4">
                    <span>Model: {digest.aiModelName}</span>
                    <span>•</span>
                    <span>{digest.keyDevelopments?.length || 0} Key Developments</span>
                    <span>•</span>
                    <span>{digest.takeaways?.length || 0} Takeaways</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {missingCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{missingCount} original source article(s) no longer in database</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400">
                        All {digest.sourceArticleIds.length} source citations preserved
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete confirmation dialog */}
                {deleteConfirmId === digest.id && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-center justify-between gap-3 animate-in fade-in">
                    <span className="text-xs text-rose-200">
                      Permanently delete this executive briefing from history?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(digest.id)}
                        className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No digests in archive</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Generated executive briefings and reports are automatically recorded here for long-term reference and audit trails.
          </p>
        </div>
      )}
    </div>
  );
};
