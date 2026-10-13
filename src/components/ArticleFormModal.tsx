import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Article, Category } from '../types.js';

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Article>) => Promise<void>;
  categories: Category[];
  initialData?: Article | null;
}

export const ArticleFormModal: React.FC<ArticleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
}) => {
  const [headline, setHeadline] = useState('');
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullText, setFullText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setHeadline(initialData.headline);
      setSource(initialData.source);
      setAuthor(initialData.author || '');
      setCanonicalUrl(initialData.canonicalUrl);
      setPublicationDate(new Date(initialData.publicationDate).toISOString().slice(0, 16));
      setCategory(initialData.category);
      setTagsInput(initialData.tags.join(', '));
      setShortDescription(initialData.shortDescription);
      setFullText(initialData.fullText || '');
    } else {
      setHeadline('');
      setSource('');
      setAuthor('');
      setCanonicalUrl('');
      setPublicationDate(new Date().toISOString().slice(0, 16));
      setCategory(categories[0]?.name || 'Technology');
      setTagsInput('');
      setShortDescription('');
      setFullText('');
    }
    setError(null);
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!headline.trim()) {
      setError('Headline is required.');
      return;
    }
    if (!source.trim()) {
      setError('Source publication name is required.');
      return;
    }
    if (!canonicalUrl.trim()) {
      setError('Canonical URL is required.');
      return;
    }
    try {
      new URL(canonicalUrl);
    } catch {
      setError('Please provide a valid URL format (e.g., https://example.com/article).');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await onSubmit({
        headline: headline.trim(),
        source: source.trim(),
        author: author.trim() || undefined,
        canonicalUrl: canonicalUrl.trim(),
        publicationDate: publicationDate ? new Date(publicationDate).toISOString() : new Date().toISOString(),
        category: category || categories[0]?.name || 'Technology',
        tags,
        shortDescription: (shortDescription || headline).trim(),
        fullText: (fullText || shortDescription || headline).trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 no-print">
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <span>{initialData ? 'Edit News Article' : 'Add Manual Industry Article'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Headline <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Breakthrough In Quantum Error Correction Reported by Academic Consortium"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Source Publication <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Financial Times, MIT Tech Review"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Author (Optional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Sarah Jenkins"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Canonical URL <span className="text-cyan-400">*</span>
            </label>
            <input
              type="url"
              required
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://example.com/reports/quantum-breakthrough"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Industry Category <span className="text-cyan-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Publication Date
              </label>
              <input
                type="datetime-local"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Quantum, Computing, Physics, Research"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Summary / Abstract <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Executive summary of the core development..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Article Text / Transcript (Optional)
            </label>
            <textarea
              rows={5}
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              placeholder="Paste full text or extensive excerpt for deeper AI synthesis..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium transition-colors shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Article' : 'Save Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
