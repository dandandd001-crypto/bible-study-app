/**
Notes on hierarchy:
- Mains: top-level topics
- Classes: nested under a Main or another Class (arbitrary depth)
- Notes: belong either directly to a Main OR to a Class

This TOC fetches all mains/classes/notes and builds a tree on the client. For very large datasets,
consider server-side pagination or on-demand fetching.
*/

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, PlusCircle, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase.js';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../UI/Button.jsx';
import { useAuth } from '../Auth/AuthProvider.jsx';
import { Skeleton } from '../UI/Skeleton.jsx';

function useContent() {
  return useQuery({
    queryKey: ['toc-content'],
    queryFn: async () => {
      const [mainsRes, classesRes, notesRes] = await Promise.all([
        supabase.from('mains').select('*').order('order_index', { ascending: true }),
        supabase.from('classes').select('*').order('order_index', { ascending: true }),
        supabase.from('notes').select('*').order('order_index', { ascending: true }),
      ]);

      if (mainsRes.error) throw mainsRes.error;
      if (classesRes.error) throw classesRes.error;
      if (notesRes.error) throw notesRes.error;

      return {
        mains: mainsRes.data ?? [],
        classes: classesRes.data ?? [],
        notes: notesRes.data ?? [],
      };
    },
  });
}

function TreeItem({ label, children, defaultOpen = false, actions }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1 text-left"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {children ? (
            open ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <span className="ml-4" />
          )}
          <span className="font-medium">{label}</span>
        </button>
        {actions}
      </div>
      {open && children && <div className="ml-5 mt-1">{children}</div>}
    </div>
  );
}

export default function TOC() {
  const { data, isLoading } = useContent();
  const { role } = useAuth();
  const location = useLocation();
  const focusMainId = location.state?.focusMainId;

  const tree = useMemo(() => {
    if (!data) return [];
    const classByParent = new Map();
    for (const c of data.classes) {
      const key = c.parent_class_id ? `c:${c.parent_class_id}` : `m:${c.main_id}`;
      if (!classByParent.has(key)) classByParent.set(key, []);
      classByParent.get(key).push(c);
    }

    const notesByMain = new Map();
    const notesByClass = new Map();
    for (const n of data.notes) {
      if (n.main_id) {
        if (!notesByMain.has(n.main_id)) notesByMain.set(n.main_id, []);
        notesByMain.get(n.main_id).push(n);
      } else if (n.class_id) {
        if (!notesByClass.has(n.class_id)) notesByClass.set(n.class_id, []);
        notesByClass.get(n.class_id).push(n);
      }
    }

    function buildClassNode(cls) {
      const childClasses = classByParent.get(`c:${cls.id}`) ?? [];
      const childNotes = notesByClass.get(cls.id) ?? [];
      return {
        type: 'class',
        id: cls.id,
        title: cls.title,
        description: cls.description,
        children: [
          ...childClasses.map(buildClassNode),
          ...childNotes.map((n) => ({ type: 'note', id: n.id, title: n.title })),
        ],
      };
    }

    return data.mains.map((m) => {
      const topClasses = classByParent.get(`m:${m.id}`) ?? [];
      const topNotes = notesByMain.get(m.id) ?? [];
      return {
        type: 'main',
        id: m.id,
        title: m.title,
        description: m.description,
        children: [
          ...topClasses.map(buildClassNode),
          ...topNotes.map((n) => ({ type: 'note', id: n.id, title: n.title })),
        ],
      };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-5 w-44" />
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contents</div>
        {role === 'admin' && (
          <Link to="/admin" title="Manage content">
            <Button size="xs" variant="outline">
              <PlusCircle size={14} className="mr-1" />
              Manage
            </Button>
          </Link>
        )}
      </div>
      <div>
        {tree.map((main) => (
          <TreeItem key={main.id} label={main.title} defaultOpen={main.id === focusMainId}>
            {main.children.map((child) =>
              child.type === 'class' ? (
                <ClassNode key={child.id} node={child} />
              ) : (
                <NoteNode key={child.id} id={child.id} title={child.title} />
              )
            )}
          </TreeItem>
        ))}
      </div>
    </div>
  );
}

function ClassNode({ node }) {
  return (
    <TreeItem label={node.title}>
      {node.children.map((child) =>
        child.type === 'class' ? (
          <ClassNode key={child.id} node={child} />
        ) : (
          <NoteNode key={child.id} id={child.id} title={child.title} />
        )
      )}
    </TreeItem>
  );
}

function NoteNode({ id, title }) {
  return (
    <div className="flex items-center gap-2 ml-5 my-1">
      <FileText size={14} className="text-slate-500" />
      <Link to={`/note/${id}`} className="text-sm hover:underline">
        {title}
      </Link>
    </div>
  );
}
