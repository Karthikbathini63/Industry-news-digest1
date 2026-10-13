import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Bookmark,
  CheckCircle,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Article, Category } from '../types.js';
import { ArticleCard } from './ArticleCard.js';

interface NewsLibraryProps {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedSource: string;
  onSourceChange: (src: string) => void;
  readFilter: 'all' | 'unread' | 'read';
  onReadFilterChange: (f: 'all' | 'unread' | 'read') => void;
  savedFilter: 'all' | 'saved';
  onSavedFilterChange: (f: 'all' | 'saved') => void;
  dateRange: 'all' | '24h' | '7d' | '30d';
  onDateRangeChange: (r: 'all' | '24h' | '7d' | '30d') => void;
  sortBy: 'newest' | 'oldest' | 'relevance';
  onSortByChange: (s: 'newest' | 'oldest' | 'relevance') => void;
  selectedArticleIds: string[];
  onToggleSelectArticle: (id: string) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onOpenReader: (article: Article) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  onDeleteArticle: (id: string, e: React.MouseEvent) => void;
  onOpenCreateModal: () => void;
  onStartDigestWithSelected: () => void;
  onResetFilters: () => void;
}

export const NewsLibrary: React.FC<NewsLibraryProps> = ({
  articles,
  total,
  page,
  totalPages,
  onPageChange,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSource,
  onSourceChange,
  readFilter,
  onReadFilterChange,
  savedFilter,
  onSavedFilterChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  onSortByChange,
  selectedArticleIds,
  onToggleSelectArticle,
  onSelectAllVisible,
  onClearSelection,
  onOpenReader,
  onToggleSave,
  onToggleRead,
  onDeleteArticle,
  onOpenCreateModal,
  onStartDigestWithSelected,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Compute unique sources from current articles
  const availableSources = Array.from(new Set(articles.map((a) => a.source))).sort();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Industry News Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Discover, curate, and filter intelligence feeds across tracked sectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Export CSV link */}
          <a
            href={`/api/export/articles.csv?category=${selectedCategory}&isSaved=${
              savedFilter === 'saved' ? 'true' : ''
            }&isRead=${
              readFilter === 'read' ? 'true' : readFilter === 'unread' ? 'false' : ''
            }&search=${encodeURIComponent(searchQuery)}`}
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Export filtered articles to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>

          {/* Add Article Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        {/* Search input + view toggles */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search headlines, excerpts, author, or tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              {searchQuery && <option value="relevance">Sort: Most Relevant</option>}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Compact List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Reset Filters */}
            <button
              onClick={onResetFilters}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset all search and filter criteria"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-parameter filter chips row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Sector / Category Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              All Sectors
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => onCategoryChange(c.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  selectedCategory.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            {/* Read Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => onReadFilterChange('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  readFilter === 'all' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => onReadFilterChange('unread')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  readFilter === 'unread' ? 'bg-slate-800 text-indigo-300' : 'hover:text-slate-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => onReadFilterChange('read')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  readFilter === 'read' ? 'bg-slate-800 text-emerald-300' : 'hover:text-slate-200'
                }`}
              >
                Read
              </button>
            </div>

            {/* Saved Filter */}
            <button
              onClick={() => onSavedFilterChange(savedFilter === 'saved' ? 'all' : 'saved')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                savedFilter === 'saved'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedFilter === 'saved' ? 'fill-amber-400' : ''}`} />
              <span>Saved Only</span>
            </button>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 ml-2 text-slate-500" />
              {(['all', '24h', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onDateRangeChange(r)}
                  className={`px-2.5 py-1 rounded-md uppercase font-mono text-[11px] transition-colors cursor-pointer ${
                    dateRange === r ? 'bg-slate-800 text-cyan-300' : 'hover:text-slate-200'
                  }`}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="text-slate-400 font-mono text-xs">
            Showing <span className="text-white font-semibold">{articles.length}</span> of{' '}
            <span className="text-white font-semibold">{total}</span> articles
          </div>
        </div>
      </div>

      {/* Multi-Selection Action Banner */}
      {selectedArticleIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-800/80 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">
              {selectedArticleIds.length} article(s) selected for briefing
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          </div>

          <button
            onClick={onStartDigestWithSelected}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Generate Targeted Digest ({selectedArticleIds.length})</span>
          </button>
        </div>
      )}

      {/* Select All Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectAllVisible}
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium"
          >
            Select all on this page ({articles.length})
          </button>
          {selectedArticleIds.length > 0 && (
            <button
              onClick={onClearSelection}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Deselect all
            </button>
          )}
        </div>
      </div>

      {/* Article Grid / List */}
      {articles.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-3'
          }
        >
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isSelected={selectedArticleIds.includes(article.id)}
              onToggleSelect={onToggleSelectArticle}
              onOpenReader={onOpenReader}
              onToggleSave={onToggleSave}
              onToggleRead={onToggleRead}
              onDelete={onDeleteArticle}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No articles match your criteria</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Try adjusting your search query, switching sector categories, or resetting active filters.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Add News Story
            </button>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            Page <span className="text-white font-semibold">{page}</span> of{' '}
            <span className="text-white font-semibold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick numeric page indicator */}
            <div className="flex items-center gap-1 font-mono text-xs">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                      page === pageNum
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
