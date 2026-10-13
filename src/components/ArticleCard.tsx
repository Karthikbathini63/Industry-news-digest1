import React from 'react';
import {
  Bookmark,
  ExternalLink,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  Tag,
} from 'lucide-react';
import { Article } from '../types.js';

interface ArticleCardProps {
  article: Article;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onOpenReader: (article: Article) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isSelected,
  onToggleSelect,
  onOpenReader,
  onToggleSave,
  onToggleRead,
  onDelete,
}) => {
  const formattedDate = new Date(article.publicationDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className={`group relative bg-slate-900/80 rounded-xl border transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-950/20 ${
        isSelected
          ? 'border-cyan-500/80 ring-1 ring-cyan-500/50 bg-slate-900'
          : article.isRead
          ? 'border-slate-800/80 opacity-90'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/90'
      }`}
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Top Meta Line */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Multi-selection Checkbox */}
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected || false}
                onChange={() => onToggleSelect(article.id)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                title="Select for Digest Generation"
              />
            )}

            {/* Category Tag */}
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800/90 text-cyan-300 border border-slate-700">
              {article.category}
            </span>

            {/* Demo dataset badge */}
            {article.isSample && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-800" title="Curated benchmark sample article">
                Sample
              </span>
            )}
          </div>

          {/* Quick status actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => onToggleRead(article.id, e)}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                article.isRead
                  ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
              title={article.isRead ? 'Mark as Unread' : 'Mark as Read'}
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => onToggleSave(article.id, e)}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                article.isSaved
                  ? 'text-amber-400 hover:text-amber-300 bg-amber-950/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
              title={article.isSaved ? 'Remove from Saved' : 'Save Article'}
            >
              <Bookmark className={`w-4 h-4 ${article.isSaved ? 'fill-amber-400' : ''}`} />
            </button>

            {onDelete && (
              <button
                onClick={(e) => onDelete(article.id, e)}
                className="p-1.5 rounded-md text-xs text-slate-600 hover:text-rose-400 hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete Article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Headline */}
        <h3
          onClick={() => onOpenReader(article)}
          className="text-base font-semibold text-slate-100 hover:text-cyan-400 transition-colors cursor-pointer line-clamp-2 leading-snug tracking-tight mb-2"
        >
          {article.headline}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
          {article.shortDescription}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            <Tag className="w-3 h-3 text-slate-500 shrink-0" />
            {article.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[11px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-800"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-[10px] text-slate-500 font-mono">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer attribution */}
      <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-950/40 rounded-b-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium text-slate-300 truncate max-w-[130px] sm:max-w-[160px]" title={article.source}>
            {article.source}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenReader(article)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium text-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Read</span>
          </button>

          <a
            href={article.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Open canonical source in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
};
