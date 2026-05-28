import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  History,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import {
  deleteResumeHistoryEntry,
  getResumeHistory,
  subscribeToResumeHistory,
  type ResumeHistoryEntry,
} from '@/lib/resume-history';

type SectionVariant = 'dashboard' | 'page';

interface ResumeHistorySectionProps {
  variant?: SectionVariant;
  limit?: number;
  hideWhenEmpty?: boolean;
  className?: string;
  onOpen?: (entry: ResumeHistoryEntry) => void;
  onDuplicate?: (entry: ResumeHistoryEntry) => void;
  onDownload?: (entry: ResumeHistoryEntry) => void;
}

export function ResumeHistorySection({
  variant = 'dashboard',
  limit,
  hideWhenEmpty = false,
  className = '',
  onOpen,
  onDuplicate,
  onDownload,
}: ResumeHistorySectionProps) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ResumeHistoryEntry[]>(() => getResumeHistory());
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getResumeHistory());
    return subscribeToResumeHistory(() => {
      setEntries(getResumeHistory());
    });
  }, []);

  const visibleEntries = useMemo(
    () => (typeof limit === 'number' ? entries.slice(0, limit) : entries),
    [entries, limit]
  );
  const hasMore = typeof limit === 'number' && entries.length > limit;
  const isEmpty = entries.length === 0;

  const groupedEntries = useMemo(() => groupByDate(visibleEntries), [visibleEntries]);

  const goToDashboardWithEntry = useCallback(
    (entry: ResumeHistoryEntry, params: Record<string, string> = {}) => {
      const search = new URLSearchParams({ historyId: entry.id, ...params });
      navigate(`/dashboard?${search.toString()}`);
    },
    [navigate]
  );

  const handleOpen = useCallback(
    (entry: ResumeHistoryEntry) => {
      if (onOpen) {
        onOpen(entry);
      } else {
        goToDashboardWithEntry(entry);
      }
    },
    [onOpen, goToDashboardWithEntry]
  );

  const handleDuplicate = useCallback(
    (entry: ResumeHistoryEntry) => {
      if (onDuplicate) {
        onDuplicate(entry);
      } else {
        goToDashboardWithEntry(entry, { mode: 'duplicate' });
      }
    },
    [onDuplicate, goToDashboardWithEntry]
  );

  const handleDownload = useCallback(
    (entry: ResumeHistoryEntry) => {
      if (onDownload) {
        onDownload(entry);
      } else {
        goToDashboardWithEntry(entry, { action: 'download' });
      }
    },
    [onDownload, goToDashboardWithEntry]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteResumeHistoryEntry(id);
      setConfirmingDelete(null);
      toast.success('Removed from history');
    },
    []
  );

  if (isEmpty && hideWhenEmpty) {
    return null;
  }

  return (
    <section className={`glass-card p-6 md:p-7 ${className}`}>
      <header className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center flex-shrink-0">
            <History className="h-5 w-5 text-pear-400" />
          </div>
          <div>
            <h2 className="font-display text-lg md:text-xl font-bold leading-tight">
              Resume History
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEmpty
                ? 'Saved automatically after each AI optimization'
                : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · auto-named from the job description`}
            </p>
          </div>
        </div>

        {variant === 'dashboard' && hasMore && (
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="text-sm text-pear-400 hover:text-pear-300 inline-flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </header>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          {groupedEntries.map(([label, items]) => (
            <div key={label}>
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground/80 mb-2 font-medium">
                {label}
              </h3>
              <div className="space-y-2">
                {items.map((entry) => (
                  <HistoryRow
                    key={entry.id}
                    entry={entry}
                    confirmingDelete={confirmingDelete === entry.id}
                    onOpen={() => handleOpen(entry)}
                    onDuplicate={() => handleDuplicate(entry)}
                    onDownload={() => handleDownload(entry)}
                    onRequestDelete={() => setConfirmingDelete(entry.id)}
                    onCancelDelete={() => setConfirmingDelete(null)}
                    onConfirmDelete={() => handleDelete(entry.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface HistoryRowProps {
  entry: ResumeHistoryEntry;
  confirmingDelete: boolean;
  onOpen: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

function HistoryRow({
  entry,
  confirmingDelete,
  onOpen,
  onDuplicate,
  onDownload,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: HistoryRowProps) {
  const now = new Date();
  const relative = formatRelative(entry.createdAt, now);
  const keywordsCount = entry.aiKeywordsMatched?.length ?? 0;
  const hasAts = typeof entry.aiAtsScore === 'number' && entry.aiAtsScore > 0;
  const hasStructured = !!entry.structuredResume;

  return (
    <div className="group glass-card-hover p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="h-4 w-4 text-pear-400 flex-shrink-0" />
            <h4 className="font-display text-sm md:text-base font-semibold truncate text-foreground">
              {entry.name}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {hasAts && (
              <span className="text-pear-400 font-medium">ATS {entry.aiAtsScore}</span>
            )}
            {keywordsCount > 0 && (
              <span>
                {keywordsCount} keyword{keywordsCount === 1 ? '' : 's'}
              </span>
            )}
            {entry.resumeFileName && (
              <span className="truncate max-w-[160px]" title={entry.resumeFileName}>
                {entry.resumeFileName}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {relative}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {confirmingDelete ? (
            <>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="px-2.5 py-1 text-xs font-medium text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
              <IconButton title="Cancel" onClick={onCancelDelete} icon={<X className="h-3.5 w-3.5" />} />
            </>
          ) : (
            <>
              <IconButton title="Open" onClick={onOpen} icon={<ArrowUpRight className="h-3.5 w-3.5" />} />
              <IconButton
                title="Duplicate (edit job description and reprocess)"
                onClick={onDuplicate}
                icon={<Copy className="h-3.5 w-3.5" />}
              />
              <IconButton
                title={hasStructured ? 'Download' : 'No structured data — reprocess first'}
                onClick={onDownload}
                icon={<Download className="h-3.5 w-3.5" />}
                disabled={!hasStructured}
              />
              <IconButton
                title="Delete from history"
                onClick={onRequestDelete}
                icon={<Trash2 className="h-3.5 w-3.5" />}
                danger
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface IconButtonProps {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

function IconButton({ title, onClick, icon, danger, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'text-red-300 hover:text-red-200 hover:bg-red-500/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
    >
      {icon}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-xl py-10 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center mx-auto mb-3">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-foreground font-medium">Your customizations will appear here</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
        Upload a resume, paste a job description, and we'll save a named entry after each AI optimization.
      </p>
    </div>
  );
}

function formatRelative(iso: string, now: Date): string {
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now';
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(entries: ResumeHistoryEntry[]): Array<[string, ResumeHistoryEntry[]]> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const groups = new Map<string, ResumeHistoryEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const label = labelForDate(date, { now, startOfToday, startOfYesterday, startOfWeek });
    const bucket = groups.get(label) ?? [];
    bucket.push(entry);
    groups.set(label, bucket);
  }
  return Array.from(groups.entries());
}

function labelForDate(
  date: Date,
  ctx: { now: Date; startOfToday: Date; startOfYesterday: Date; startOfWeek: Date }
): string {
  if (date >= ctx.startOfToday) return 'Today';
  if (date >= ctx.startOfYesterday) return 'Yesterday';
  if (date >= ctx.startOfWeek) return 'This Week';
  if (date.getFullYear() === ctx.now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
