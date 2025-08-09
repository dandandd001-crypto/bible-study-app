import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { Input } from '../UI/Input.jsx';
import { cn } from '../../styles/utils.js';
import { Skeleton } from '../UI/Skeleton.jsx';

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState({ mains: [], classes: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let active = true;

    async function runSearch() {
      if (!q.trim()) {
        setResults({ mains: [], classes: [], notes: [] });
        return;
      }
      setLoading(true);

      const [mains, classes, notes] = await Promise.all([
        supabase.from('mains').select('id, title, description').ilike('title', `%${q}%`),
        supabase.from('classes').select('id, title, description').ilike('title', `%${q}%`),
        supabase.from('notes').select('id, title, body').or(`title.ilike.%${q}%,body.ilike.%${q}%`),
      ]);

      if (!active) return;

      setResults({
        mains: mains.data ?? [],
        classes: classes.data ?? [],
        notes: notes.data ?? [],
      });
      setLoading(false);
    }

    const t = setTimeout(runSearch, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  const hasAny = useMemo(
    () => results.mains.length + results.classes.length + results.notes.length > 0,
    [results]
  );

  function onOpenMain(mainId) {
    // Navigate to home with a state to highlight/open in TOC
    navigate('/', { state: { focusMainId: mainId } });
    setOpen(false);
  }

  function onOpenNote(noteId) {
    navigate(`/note/${noteId}`);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 px-3 py-2 rounded border bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900"
        title="Search (Ctrl/Cmd + K)"
      >
        <Search size={18} className="text-slate-500" />
        <span className="text-sm text-slate-500">Search...</span>
        <kbd className="ml-6 text-xs text-slate-400 border rounded px-1">Ctrl/Cmd + K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-24 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-slate-900 border shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 p-3 border-b">
          <Search className="text-slate-500" size={18} />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search mains, classes, notes..."
            className="flex-1"
          />
          <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-96 overflow-auto p-3 space-y-4">
          {loading && (
            <>
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-80" />
              <Skeleton className="h-5 w-64" />
            </>
          )}

          {!loading && !hasAny && q.trim() && (
            <div className="text-sm text-slate-500">No results for "{q}".</div>
          )}

          {!loading && results.mains.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Mains</div>
              <ul className="space-y-1">
                {results.mains.map((m) => (
                  <li key={m.id}>
                    <button
                      onClick={() => onOpenMain(m.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <div className="font-medium">{m.title}</div>
                      {m.description && (
                        <div className="text-xs text-slate-500 line-clamp-1">{m.description}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && results.classes.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Classes</div>
              <ul className="space-y-1">
                {results.classes.map((c) => (
                  <li key={c.id}>
                    <div className="px-3 py-2 rounded bg-slate-50 dark:bg-slate-800/60">
                      <div className="font-medium">{c.title}</div>
                      {c.description && (
                        <div className="text-xs text-slate-500 line-clamp-1">{c.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && results.notes.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Notes</div>
              <ul className="space-y-1">
                {results.notes.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => onOpenNote(n.id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div className="font-medium">{n.title}</div>
                      {n.body && (
                        <div className="text-xs text-slate-500 line-clamp-1">{n.body}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
