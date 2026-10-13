import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import {
  Article,
  Digest,
  Category,
  IngestionLog,
  VettedRssFeed,
  DashboardStats,
  SystemStatus,
  ViewTab,
} from './types.js';
import { Header } from './components/Header.js';
import { Dashboard } from './components/Dashboard.js';
import { NewsLibrary } from './components/NewsLibrary.js';
import { DigestStudio } from './components/DigestStudio.js';
import { DigestHistory } from './components/DigestHistory.js';
import { IngestionWorkspace } from './components/IngestionWorkspace.js';
import { ArticleReaderModal } from './components/ArticleReaderModal.js';
import { ArticleFormModal } from './components/ArticleFormModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { ToastContainer, ToastMessage } from './components/Toast.js';

export default function App() {
  // Navigation & View
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Core Data
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [digests, setDigests] = useState<Digest[]>([]);
  const [vettedFeeds, setVettedFeeds] = useState<VettedRssFeed[]>([]);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [savedFilter, setSavedFilter] = useState<'all' | 'saved'>('all');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'relevance'>('newest');

  // Multi-article Selection for Digest Studio
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);

  // Modals & Drawers
  const [readerArticle, setReaderArticle] = useState<Article | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback(
    (type: ToastMessage['type'], title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Stats & System Status
  const loadStatsAndStatus = useCallback(async () => {
    try {
      const [s, st] = await Promise.all([api.getStats(), api.getStatus()]);
      setStats(s);
      setSystemStatus(st);
    } catch (err) {
      console.error('Failed to load stats/status:', err);
    }
  }, []);

  // Fetch Categories
  const loadCategories = useCallback(async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Fetch Ingestion Feeds & Logs
  const loadIngestionData = useCallback(async () => {
    try {
      const [feeds, logs] = await Promise.all([
        api.getVettedFeeds(),
        api.getIngestionLogs(),
      ]);
      setVettedFeeds(feeds);
      setIngestionLogs(logs);
    } catch (err) {
      console.error('Failed to load ingestion data:', err);
    }
  }, []);

  // Fetch Saved Digests
  const loadDigests = useCallback(async () => {
    try {
      const d = await api.getDigests();
      setDigests(d);
    } catch (err) {
      console.error('Failed to load digests:', err);
    }
  }, []);

  // Fetch Articles with Active Filters
  const loadArticles = useCallback(async () => {
    try {
      const res = await api.getArticles({
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        source: selectedSource !== 'all' ? selectedSource : undefined,
        isRead: readFilter === 'read' ? true : readFilter === 'unread' ? false : undefined,
        isSaved: savedFilter === 'saved' ? true : undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined,
        sortBy,
        page: currentPage,
        limit: 18,
      });

      setArticles(res.articles);
      setTotalArticles(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load articles:', err);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedSource,
    readFilter,
    savedFilter,
    dateRange,
    sortBy,
    currentPage,
  ]);

  // Initial load
  useEffect(() => {
    loadStatsAndStatus();
    loadCategories();
    loadDigests();
    loadIngestionData();
  }, [loadStatsAndStatus, loadCategories, loadDigests, loadIngestionData]);

  // Reload articles on filter change
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setCurrentTab('library');
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ----------------------------------------------------
  // ARTICLE ACTIONS
  // ----------------------------------------------------
  const handleToggleRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const updated = await api.toggleRead(id);
      setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (readerArticle?.id === id) setReaderArticle(updated);
      loadStatsAndStatus();
    } catch (err: any) {
      notify('error', 'Update Failed', err?.message);
    }
  };

  const handleToggleSave = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const updated = await api.toggleSaved(id);
      setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (readerArticle?.id === id) setReaderArticle(updated);
      loadStatsAndStatus();
      notify('success', updated.isSaved ? 'Article Saved to Research' : 'Article Removed from Saved');
    } catch (err: any) {
      notify('error', 'Update Failed', err?.message);
    }
  };

  const handleDeleteArticle = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSelectedArticleIds((prev) => prev.filter((artId) => artId !== id));
      if (readerArticle?.id === id) setReaderArticle(null);
      loadStatsAndStatus();
      notify('success', 'Article deleted from library');
    } catch (err: any) {
      notify('error', 'Delete Failed', err?.message);
    }
  };

  const handleCreateOrUpdateArticle = async (data: Partial<Article>) => {
    if (editingArticle) {
      const updated = await api.updateArticle(editingArticle.id, data);
      setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? updated : a)));
      setEditingArticle(null);
      notify('success', 'Article Updated');
    } else {
      const created = await api.createArticle(data);
      setArticles((prev) => [created, ...prev]);
      notify('success', 'Article Created', created.headline);
    }
    loadStatsAndStatus();
  };

  // Multi-Selection
  const handleToggleSelectArticle = (id: string) => {
    setSelectedArticleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const pageIds = articles.map((a) => a.id);
    setSelectedArticleIds((prev) => Array.from(new Set([...prev, ...pageIds])));
  };

  const handleClearSelection = () => {
    setSelectedArticleIds([]);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSource('all');
    setReadFilter('all');
    setSavedFilter('all');
    setDateRange('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // ----------------------------------------------------
  // INGESTION ACTIONS
  // ----------------------------------------------------
  const handleSyncRss = async (url: string, category?: string, sourceName?: string) => {
    const res = await api.ingestRss({ url, category, sourceName });
    await Promise.all([loadArticles(), loadStatsAndStatus(), loadIngestionData()]);
    return res;
  };

  const handleIngestUrl = async (url: string, category?: string) => {
    const res = await api.ingestUrl({ url, category });
    await Promise.all([loadArticles(), loadStatsAndStatus(), loadIngestionData()]);
    return res;
  };

  // ----------------------------------------------------
  // DIGEST ACTIONS
  // ----------------------------------------------------
  const handleGenerateDigest = async (params: {
    articleIds?: string[];
    categories?: string[];
    dateRange?: string;
    lengthType?: string;
    focusTopic?: string;
  }) => {
    const digest = await api.generateDigest(params);
    setDigests((prev) => [digest, ...prev]);
    loadStatsAndStatus();
    return digest;
  };

  const handleDeleteDigest = async (id: string) => {
    await api.deleteDigest(id);
    setDigests((prev) => prev.filter((d) => d.id !== id));
    loadStatsAndStatus();
  };

  const handleRegenerateDigest = (digest: Digest) => {
    setSelectedArticleIds(digest.sourceArticleIds);
    setCurrentTab('studio');
    notify('info', 'Loaded Source Articles', `Loaded ${digest.sourceArticleIds.length} source articles into Studio queue.`);
  };

  // ----------------------------------------------------
  // CATEGORY & RESET ACTIONS
  // ----------------------------------------------------
  const handleAddCategory = async (name: string, description: string, colorHex: string) => {
    const cat = await api.createCategory({ name, description, colorHex });
    setCategories((prev) => [...prev, cat]);
  };

  const handleResetDemo = async () => {
    await api.resetDemo();
    await Promise.all([
      loadArticles(),
      loadDigests(),
      loadStatsAndStatus(),
      loadIngestionData(),
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        systemStatus={systemStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickGenerate={() => setCurrentTab('studio')}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            recentDigests={digests}
            recentArticles={articles}
            categories={categories}
            onSelectTab={setCurrentTab}
            onOpenArticle={(art) => setReaderArticle(art)}
            onOpenDigest={(d) => {
              setCurrentTab('studio');
            }}
            onQuickSyncFeed={async (feedUrl) => {
              notify('info', 'Syncing Feed...', 'Contacting syndication source');
              try {
                const res = await handleSyncRss(feedUrl);
                notify('success', 'Feed Synced', res.message);
              } catch (err: any) {
                notify('error', 'Feed Sync Failed', err?.message);
              }
            }}
            onFilterByCategory={(catName) => {
              setSelectedCategory(catName);
              setCurrentTab('library');
            }}
          />
        )}

        {currentTab === 'library' && (
          <NewsLibrary
            articles={articles}
            total={totalArticles}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={(c) => {
              setSelectedCategory(c);
              setCurrentPage(1);
            }}
            selectedSource={selectedSource}
            onSourceChange={(s) => {
              setSelectedSource(s);
              setCurrentPage(1);
            }}
            readFilter={readFilter}
            onReadFilterChange={(f) => {
              setReadFilter(f);
              setCurrentPage(1);
            }}
            savedFilter={savedFilter}
            onSavedFilterChange={(f) => {
              setSavedFilter(f);
              setCurrentPage(1);
            }}
            dateRange={dateRange}
            onDateRangeChange={(r) => {
              setDateRange(r);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={(s) => {
              setSortBy(s);
              setCurrentPage(1);
            }}
            selectedArticleIds={selectedArticleIds}
            onToggleSelectArticle={handleToggleSelectArticle}
            onSelectAllVisible={handleSelectAllVisible}
            onClearSelection={handleClearSelection}
            onOpenReader={(art) => setReaderArticle(art)}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
            onDeleteArticle={handleDeleteArticle}
            onOpenCreateModal={() => {
              setEditingArticle(null);
              setIsCreateModalOpen(true);
            }}
            onStartDigestWithSelected={() => {
              setCurrentTab('studio');
            }}
            onResetFilters={handleResetFilters}
          />
        )}

        {currentTab === 'studio' && (
          <DigestStudio
            categories={categories}
            allArticles={articles}
            preSelectedArticleIds={selectedArticleIds}
            onClearPreSelected={handleClearSelection}
            onGenerate={handleGenerateDigest}
            onOpenArticleById={(id) => {
              const art = articles.find((a) => a.id === id);
              if (art) setReaderArticle(art);
            }}
            onNotify={notify}
          />
        )}

        {currentTab === 'history' && (
          <DigestHistory
            digests={digests}
            allArticles={articles}
            onOpenDigest={(d) => {
              setCurrentTab('studio');
            }}
            onDeleteDigest={handleDeleteDigest}
            onRegenerateDigest={handleRegenerateDigest}
            onNotify={notify}
          />
        )}

        {currentTab === 'ingestion' && (
          <IngestionWorkspace
            vettedFeeds={vettedFeeds}
            logs={ingestionLogs}
            categories={categories}
            onSyncRss={handleSyncRss}
            onIngestUrl={handleIngestUrl}
            onRefreshLogs={loadIngestionData}
            onNotify={notify}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Industry News Digest Reader</span>
            <span>•</span>
            <span>Editorial Intelligence Workspace</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Model: gemini-3.8-flash</span>
            <span>•</span>
            <span>Zero-Pill High Contrast Design</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Architecture & Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Article Reader Modal */}
      <ArticleReaderModal
        article={readerArticle}
        onClose={() => setReaderArticle(null)}
        onToggleRead={(id) => handleToggleRead(id)}
        onToggleSave={(id) => handleToggleSave(id)}
        onSelectForDigest={(id) => {
          if (!selectedArticleIds.includes(id)) {
            setSelectedArticleIds([...selectedArticleIds, id]);
          }
        }}
        allArticles={articles}
        onOpenArticle={(art) => setReaderArticle(art)}
        onNotify={notify}
      />

      {/* Create / Edit Article Modal */}
      <ArticleFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleCreateOrUpdateArticle}
        categories={categories}
        initialData={editingArticle}
      />

      {/* System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemStatus={systemStatus}
        categories={categories}
        onAddCategory={handleAddCategory}
        onResetDemo={handleResetDemo}
        onNotify={notify}
      />
    </div>
  );
}
