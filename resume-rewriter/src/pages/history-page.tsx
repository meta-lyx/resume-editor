import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { ResumeHistorySection } from '@/components/dashboard/resume-history-section';
import {
  clearResumeHistory,
  getResumeHistory,
  subscribeToResumeHistory,
  type ResumeHistoryEntry,
} from '@/lib/resume-history';

export function ResumeHistoryPage() {
  const navigate = useNavigate();
  const [count, setCount] = useState<number>(() => getResumeHistory().length);

  useEffect(() => {
    const refresh = () => setCount(getResumeHistory().length);
    refresh();
    return subscribeToResumeHistory(refresh);
  }, []);

  const navigateWith = useCallback(
    (entry: ResumeHistoryEntry, extra: Record<string, string> = {}) => {
      const params = new URLSearchParams({ historyId: entry.id, ...extra });
      navigate(`/dashboard?${params.toString()}`);
    },
    [navigate]
  );

  const handleClearAll = () => {
    if (!window.confirm('Delete all saved history? This cannot be undone.')) return;
    clearResumeHistory();
    toast.success('History cleared');
  };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="orb orb-pear w-[500px] h-[500px] -top-32 -left-32 opacity-15 pointer-events-none" />
      <div className="orb orb-cyan w-[400px] h-[400px] bottom-0 right-0 opacity-10 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pear-400/10 border border-pear-400/20 text-pear-400 text-xs font-medium mb-3">
                <History className="w-3.5 h-3.5" />
                Stored locally on this device
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Resume History
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                Every AI optimization is saved automatically with a name derived from the job description.
                Open, duplicate, or download any past version.
              </p>
            </div>
            {count > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-red-300 border-red-500/30 hover:bg-red-500/10 hover:text-red-200 self-start md:self-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>

          <ResumeHistorySection
            variant="page"
            onOpen={(entry) => navigateWith(entry)}
            onDuplicate={(entry) => navigateWith(entry, { mode: 'duplicate' })}
            onDownload={(entry) => navigateWith(entry, { action: 'download' })}
          />
        </div>
      </div>
    </div>
  );
}
