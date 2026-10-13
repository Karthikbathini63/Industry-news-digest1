import React, { useState } from 'react';
import {
  X,
  Settings,
  Database,
  Cpu,
  Layers,
  RotateCcw,
  CheckCircle,
  Plus,
  Server,
  Key,
} from 'lucide-react';
import { Category, SystemStatus } from '../types.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: SystemStatus | null;
  categories: Category[];
  onAddCategory: (name: string, description: string, colorHex: string) => Promise<void>;
  onResetDemo: () => Promise<void>;
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
  categories,
  onAddCategory,
  onResetDemo,
  onNotify,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#0ea5e9');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsAddingCat(true);
    try {
      await onAddCategory(newCatName.trim(), newCatDesc.trim(), newCatColor);
      setNewCatName('');
      setNewCatDesc('');
      onNotify('success', 'Industry Sector Added', `"${newCatName}" is now available in search and digests.`);
    } catch (err: any) {
      onNotify('error', 'Failed to add sector', err?.message);
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await onResetDemo();
      setShowResetConfirm(false);
      onNotify('success', 'Benchmark Dataset Restored', 'The news library has been reset to curated sample intelligence.');
    } catch (err: any) {
      onNotify('error', 'Reset failed', err?.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 no-print">
      <div
        className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              System Settings & Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {/* Section 1: AI Model Engine Architecture */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AI Intelligence Engine</span>
              </h3>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                  systemStatus?.geminiConfigured
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                }`}
              >
                {systemStatus?.geminiConfigured ? 'Gemini 3.8 Flash Online' : 'Deterministic Offline Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Summaries and executive digests are generated strictly on the secure Node.js server using{' '}
              <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">gemini-3.8-flash</code>.
              When an API key is not configured, the platform automatically engages its rule-based offline analytical engine so student and research workflows are never interrupted.
            </p>
          </div>

          {/* Section 2: Local Storage Persistence */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Local Storage Persistence</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/80">
                Local Synced
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All articles, categories, bookmarks, reading states, and synthesized digests are securely stored in persistent local storage (<code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">server/data/store.json</code>). No external database accounts or credentials are required.
            </p>
          </div>

          {/* Section 3: Industry Categories Management */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Tracked Industry Sectors ({categories.length})</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: c.colorHex }}
                  />
                  <span className="text-slate-200 font-medium">{c.name}</span>
                </div>
              ))}
            </div>

            {/* Add Custom Sector Form */}
            <form onSubmit={handleAddCategorySubmit} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="New sector name (e.g. Space Economy, Robotics)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-700 bg-slate-900 cursor-pointer p-0.5"
                title="Choose sector color"
              />
              <button
                type="submit"
                disabled={isAddingCat || !newCatName.trim()}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0"
              >
                Add Sector
              </button>
            </form>
          </div>

          {/* Section 4: Benchmark Dataset Management */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Data Management & Demo Benchmark
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reset the news library to the initial curated benchmark dataset with sample intelligence across technology, finance, clean energy, and healthcare.
            </p>

            {showResetConfirm ? (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 flex items-center justify-between gap-3 mt-2">
                <span className="text-xs text-rose-200">
                  Reset database to default sample articles? Current customs will be overwritten.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    disabled={isResetting}
                    className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    {isResetting ? 'Resetting...' : 'Yes, Reset'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset to Sample Intelligence Benchmark</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
