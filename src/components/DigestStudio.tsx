import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  Download,
  Copy,
  Check,
  Calendar,
  Layers,
  Target,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  BookOpen,
  Info,
} from 'lucide-react';
import { Digest, Category, Article } from '../types.js';

interface DigestStudioProps {
  categories: Category[];
  allArticles: Article[];
  preSelectedArticleIds: string[];
  onClearPreSelected: () => void;
  onGenerate: (params: {
    articleIds?: string[];
    categories?: string[];
    dateRange?: string;
    lengthType?: string;
    focusTopic?: string;
  }) => Promise<Digest>;
  onOpenArticleById: (id: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DigestStudio: React.FC<DigestStudioProps> = ({
  categories,
  allArticles,
  preSelectedArticleIds,
  onClearPreSelected,
  onGenerate,
  onOpenArticleById,
  onNotify,
}) => {
  const [lengthType, setLengthType] = useState<'brief' | 'comprehensive' | 'strategic'>('comprehensive');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d'>('7d');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [focusTopic, setFocusTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDigest, setCurrentDigest] = useState<Digest | null>(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);

  // Toggle category in filter
  const toggleCat = (catName: string) => {
    if (selectedCats.includes(catName)) {
      setSelectedCats(selectedCats.filter((c) => c !== catName));
    } else {
      setSelectedCats([...selectedCats, catName]);
    }
  };

  // Determine which articles will be analyzed
  const targetArticles = preSelectedArticleIds.length > 0
    ? allArticles.filter((a) => preSelectedArticleIds.includes(a.id))
    : allArticles.filter((a) => {
        if (selectedCats.length > 0 && !selectedCats.includes(a.category)) return false;
        if (dateRange !== 'all') {
          const cutoffMap = { '24h': 86400000, '7d': 7 * 86400000, '30d': 30 * 86400000 };
          const cutoff = Date.now() - cutoffMap[dateRange];
          if (new Date(a.publicationDate).getTime() < cutoff) return false;
        }
        return true;
      });

  const handleStartGeneration = async () => {
    if (targetArticles.length === 0) {
      onNotify('error', 'No articles available', 'Adjust date horizon or categories to select at least one article.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const digest = await onGenerate({
        articleIds: preSelectedArticleIds.length > 0 ? preSelectedArticleIds : undefined,
        categories: selectedCats.length > 0 ? selectedCats : undefined,
        dateRange,
        lengthType,
        focusTopic: focusTopic.trim() || undefined,
      });

      clearInterval(stepInterval);
      setCurrentDigest(digest);
      onNotify('success', 'Digest Generated Successfully', `${digest.referencedArticles?.length || 0} source articles cited.`);
    } catch (err: any) {
      clearInterval(stepInterval);
      onNotify('error', 'Generation Failed', err?.message || 'Server error occurred during synthesis.');
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleCopyMarkdown = () => {
    if (!currentDigest) return;

    let md = `# ${currentDigest.title}\n\n`;
    md += `**Horizon:** ${currentDigest.dateRangeLabel} | **Scope:** ${currentDigest.lengthType} | **AI Model:** ${currentDigest.aiModelName}\n\n`;
    md += `## Executive Overview\n${currentDigest.overview}\n\n`;

    md += `## Key Developments\n`;
    currentDigest.keyDevelopments.forEach((kd) => {
      md += `### [${kd.impactLevel} Impact] ${kd.title}\n${kd.summary}\n\n`;
    });

    md += `## Strategic Takeaways\n`;
    currentDigest.takeaways.forEach((t) => {
      md += `- **${t.point}**: ${t.significance}\n`;
    });

    md += `\n## Emerging Themes\n`;
    currentDigest.emergingThemes.forEach((et) => {
      md += `- **${et.theme}** (${et.prevalence}): ${et.description}\n`;
    });

    md += `\n## Potential Implications\n`;
    currentDigest.potentialImplications.forEach((pi) => {
      md += `- **${pi.sectorOrDomain}** [${pi.timeframe}]: ${pi.implication}\n`;
    });

    md += `\n## Source Citations & References\n`;
    currentDigest.referencedArticles.forEach((ra) => {
      md += `- **${ra.source}**: ${ra.headline} (${ra.citationRole})\n`;
    });

    navigator.clipboard.writeText(md);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    onNotify('success', 'Digest copied as formatted Markdown');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>AI Digest Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Synthesize multi-source news into grounded, auditable executive briefings.
          </p>
        </div>

        {currentDigest && (
          <div className="flex items-center gap-2">
            <a
              href={`/api/export/digests/${currentDigest.id}.csv`}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{hasCopied ? 'Copied' : 'Copy MD'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel: Generator Parameters (Hidden during print) */}
        <div className="lg:col-span-4 space-y-6 no-print">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Synthesis Configuration</span>
              </h2>
              {preSelectedArticleIds.length > 0 && (
                <button
                  onClick={onClearPreSelected}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Scope / Length Option */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Report Scope & Depth
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'brief', label: 'Briefing', desc: '3 min' },
                  { id: 'comprehensive', label: 'Standard', desc: 'Executive' },
                  { id: 'strategic', label: 'Strategic', desc: 'In-Depth' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLengthType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      lengthType === item.id
                        ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Article Scope Notice */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">Analysis Base:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {targetArticles.length} Article(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {preSelectedArticleIds.length > 0
                  ? `Using ${preSelectedArticleIds.length} specifically selected articles from your news library.`
                  : `Filtering all articles by selected sectors and time horizon.`}
              </p>
            </div>

            {/* Time Horizon (only if not using pre-selected articles) */}
            {preSelectedArticleIds.length === 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Time Horizon
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '24h', label: '24 Hours' },
                    { id: '7d', label: '7 Days' },
                    { id: '30d', label: '30 Days' },
                    { id: 'all', label: 'All' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setDateRange(r.id as any)}
                      className={`py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        dateRange === r.id
                          ? 'bg-slate-800 text-cyan-400 border-cyan-500/60'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sectors to Include */}
            {preSelectedArticleIds.length === 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Sectors Included
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {selectedCats.length === 0 ? 'All Sectors' : `${selectedCats.length} selected`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {categories.map((c) => {
                    const active = selectedCats.includes(c.name);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCat(c.name)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                          active
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specific Investigative Focus Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Strategic Focus (Optional)
              </label>
              <input
                type="text"
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
                placeholder="e.g., Venture capital shift, Battery storage, AI inference"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Directs the synthesizer to prioritize specific thematic angles.
              </p>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating || targetArticles.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>
                {isGenerating ? 'Synthesizing Intelligence...' : 'Generate Executive Digest'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Output Panel: Executive Report Display */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Progress State */}
          {isGenerating && (
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-6 no-print">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-t-cyan-400 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin flex items-center justify-center" />
                <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Synthesizing Multi-Source Digest
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Extracting factual signals from {targetArticles.length} verified news reports, cross-correlating themes, and establishing rigorous source traceability.
                </p>
              </div>

              {/* Step indicator */}
              <div className="max-w-sm mx-auto space-y-2 text-xs text-left">
                {[
                  '1. Filtering and parsing source articles...',
                  '2. Correlating macro trends and sector movements...',
                  '3. Validating claims strictly against source IDs...',
                  '4. Structuring executive takeaways and implications...',
                ].map((stepText, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 ${
                      generationStep > idx
                        ? 'text-cyan-400 font-semibold'
                        : generationStep === idx + 1
                        ? 'text-slate-200 animate-pulse font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        generationStep > idx
                          ? 'bg-cyan-400'
                          : generationStep === idx + 1
                          ? 'bg-indigo-400'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span>{stepText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Digest Report */}
          {currentDigest && !isGenerating && (
            <div className="p-6 sm:p-10 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8 print-card">
              {/* Report Header */}
              <div className="border-b border-slate-800 pb-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                  <span className="font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                    Executive Briefing
                  </span>
                  <span>•</span>
                  <span>Horizon: {currentDigest.dateRangeLabel}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">
                    Generated {new Date(currentDigest.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {currentDigest.title}
                </h1>

                {currentDigest.focusTopic && (
                  <p className="text-xs text-indigo-300 mt-2 font-medium">
                    Thematic Focus: {currentDigest.focusTopic}
                  </p>
                )}
              </div>

              {/* Executive Overview */}
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Executive Synthesis</span>
                </h3>
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm sm:text-base text-slate-200 leading-relaxed">
                  {currentDigest.overview}
                </div>
              </div>

              {/* Key Developments */}
              {currentDigest.keyDevelopments && currentDigest.keyDevelopments.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Key Developments & Signal Highlights</span>
                  </h3>
                  <div className="space-y-4">
                    {currentDigest.keyDevelopments.map((kd, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/70 space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-semibold text-white leading-snug">
                            {kd.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                              kd.impactLevel === 'High'
                                ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                                : kd.impactLevel === 'Medium'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {kd.impactLevel} Impact
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {kd.summary}
                        </p>

                        {/* Citation Chips */}
                        {kd.sourceArticleIds && kd.sourceArticleIds.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Cited Sources:
                            </span>
                            {kd.sourceArticleIds.map((artId) => {
                              const art = allArticles.find((a) => a.id === artId);
                              return (
                                <button
                                  key={artId}
                                  onClick={() => onOpenArticleById(artId)}
                                  className="text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 px-2 py-0.5 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1 font-mono"
                                  title={art ? art.headline : 'View Source Article'}
                                >
                                  <span>{art ? art.source : 'Source'}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Takeaways */}
              {currentDigest.takeaways && currentDigest.takeaways.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Strategic Takeaways</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentDigest.takeaways.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/70 flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200 mb-1 leading-snug">
                            {t.point}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {t.significance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emerging Themes & Potential Implications (2-column layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Emerging Themes */}
                {currentDigest.emergingThemes && currentDigest.emergingThemes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      Emerging Macro Themes
                    </h3>
                    <div className="space-y-3">
                      {currentDigest.emergingThemes.map((et, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                            <span>{et.theme}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">{et.prevalence}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {et.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Implications */}
                {currentDigest.potentialImplications && currentDigest.potentialImplications.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      Forward-Looking Implications
                    </h3>
                    <div className="space-y-3">
                      {currentDigest.potentialImplications.map((pi, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                            <span>{pi.sectorOrDomain}</span>
                            <span className="text-[10px] text-indigo-400 font-mono">{pi.timeframe}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {pi.implication}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Source Audit Traceability Table */}
              {currentDigest.referencedArticles && currentDigest.referencedArticles.length > 0 && (
                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Source Audit & Citations ({currentDigest.referencedArticles.length})</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Publication</th>
                          <th className="py-2.5 px-3">Headline</th>
                          <th className="py-2.5 px-3">Citation Role</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                        {currentDigest.referencedArticles.map((ra, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-cyan-300 whitespace-nowrap">
                              {ra.source}
                            </td>
                            <td className="py-2.5 px-3 text-slate-200 max-w-xs truncate">
                              {ra.headline}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {ra.citationRole}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => onOpenArticleById(ra.articleId)}
                                className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI Grounding Notice & Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-400">Model Attribution:</span> Powered by {currentDigest.aiModelName}. Factual assertions within this briefing are synthesized strictly from the referenced source publications above. Users should verify mission-critical decisions against the primary canonical articles.
              </div>
            </div>
          )}

          {/* Empty Prompt State when no digest is active */}
          {!currentDigest && !isGenerating && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 no-print">
              <Sparkles className="w-12 h-12 text-cyan-500/40 mx-auto mb-4" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Ready to Generate Intelligence Briefing
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                Select your parameters on the left or customize target articles, then click "Generate Executive Digest" to run multi-source synthesis.
              </p>
              <button
                onClick={handleStartGeneration}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Start Synthesis ({targetArticles.length} Articles)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
