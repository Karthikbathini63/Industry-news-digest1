import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  CheckCircle,
  Calendar,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Article } from '../types.js';

interface ArticleReaderModalProps {
  article: Article | null;
  onClose: () => void;
  onToggleRead: (id: string) => void;
  onToggleSave: (id: string) => void;
  onSelectForDigest?: (id: string) => void;
  allArticles: Article[];
  onOpenArticle: (art: Article) => void;
  onNotify: (type: 'success' | 'info', title: string, message?: string) => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  onClose,
  onToggleRead,
  onToggleSave,
  onSelectForDigest,
  allArticles,
  onOpenArticle,
  onNotify,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  // Calculate reading time
  const fullText = article.fullText || article.shortDescription;
  const wordCount = fullText.trim().split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Find related articles (same category, different ID)
  const related = allArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(article.canonicalUrl);
    onNotify('success', 'Canonical URL copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 no-print">
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
              {article.category}
            </span>
            {article.isSample && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                Sample Intelligence
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Read */}
            <button
              onClick={() => onToggleRead(article.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                article.isRead
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{article.isRead ? 'Read' : 'Mark as Read'}</span>
            </button>

            {/* Toggle Saved */}
            <button
              onClick={() => onToggleSave(article.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                article.isSaved
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${article.isSaved ? 'fill-amber-400' : ''}`} />
              <span>{article.isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Copy Share Link */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              title="Copy Canonical URL"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Close Reader (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* Headline */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight leading-snug mb-4">
            {article.headline}
          </h1>

          {/* Attribution Strip */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pb-5 mb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>{article.source}</span>
            </div>

            {article.author && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5" />
                <span>{article.author}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(article.publicationDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>~{readTimeMin} min read</span>
            </div>

            <a
              href={article.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <span>Original Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Article Summary Box */}
          <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Executive Abstract
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{article.shortDescription}"
            </p>
          </div>

          {/* Full Text / Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
            {fullText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Categorized Tags:</span>
              {article.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Related Articles in Sector */}
          {related.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
                Related {article.category} Developments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onOpenArticle(rel)}
                    className="p-3 rounded-lg bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] text-cyan-400 font-medium block mb-1">
                        {rel.source}
                      </span>
                      <h4 className="text-xs font-medium text-slate-200 line-clamp-2">
                        {rel.headline}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                      Read story <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px] text-slate-500 truncate max-w-xs">
            ID: {article.id}
          </span>
          <div className="flex items-center gap-3">
            {onSelectForDigest && (
              <button
                onClick={() => {
                  onSelectForDigest(article.id);
                  onNotify('success', 'Article added to Digest queue');
                }}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Queue for AI Digest</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
