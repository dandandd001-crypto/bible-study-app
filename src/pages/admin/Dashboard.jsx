/**
Admin Dashboard features:
- Create/Edit/Delete Mains
- Create/Edit/Delete Classes (nested)
- Create/Edit/Delete Notes
- Upload images to Supabase Storage
- Reorder Classes & Notes under their parent
- Search content by keyword

Simplified, but complete: left panel manages entities, right panel shows forms and lists.
*/

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase.js';
import { Button } from '../../components/UI/Button.jsx';
import { Input } from '../../components/UI/Input.jsx';
import { Textarea } from '../../components/UI/Textarea.jsx';
import { Select } from '../../components/UI/Select.jsx';
import ImageUploader from '../../components/Content/ImageUploader.jsx';
import toast from 'react-hot-toast';
import { Trash2, Edit, Plus, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Skeleton } from '../../components/UI/Skeleton.jsx';

function useAllContent() {
  return useQuery({
    queryKey: ['admin-all'],
    queryFn: async () => {
      const [mains, classes, notes] = await Promise.all([
        supabase.from('mains').select('*').order('order_index', { ascending: true }),
        supabase.from('classes').select('*').order('order_index', { ascending: true }),
        supabase.from('notes').select('*').order('order_index', { ascending: true }),
      ]);
      if (mains.error) throw mains.error;
      if (classes.error) throw classes.error;
      if (notes.error) throw notes.error;
      return { mains: mains.data ?? [], classes: classes.data ?? [], notes: notes.data ?? [] };
    },
  });
}

function reorderList(items, id, direction) {
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return items;
  const newItems = [...items];
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return items;
  const temp = newItems[idx].order_index;
  newItems[idx].order_index = newItems[swapIdx].order_index;
  newItems[swapIdx].order_index = temp;
  const t = newItems[idx];
  newItems[idx] = newItems[swapIdx];
  newItems[swapIdx] = t;
  return newItems;
}

export default function Dashboard() {
  const { data, isLoading, isError, error } = useAllContent();
  const [activeTab, setActiveTab] = useState('mains'); // mains | classes | notes
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.title = 'Admin • Bible Study';
  }, []);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded border bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4">
        <div className="font-semibold mb-1">Unable to load admin data.</div>
        <div className="text-sm">{error?.message || 'Unknown error'}</div>
      </div>
    );
  }

  const mains = data?.mains ?? [];
  const classes = data?.classes ?? [];
  const notes = data?.notes ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant={activeTab === 'mains' ? 'primary' : 'outline'} onClick={() => setActiveTab('mains')}>
          Mains
        </Button>
        <Button variant={activeTab === 'classes' ? 'primary' : 'outline'} onClick={() => setActiveTab('classes')}>
          Classes
        </Button>
        <Button variant={activeTab === 'notes' ? 'primary' : 'outline'} onClick={() => setActiveTab('notes')}>
          Notes
        </Button>
        <div className="ml-auto relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input className="pl-8 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {activeTab === 'mains' && <MainsManager mains={mains} search={search} />}
      {activeTab === 'classes' && <ClassesManager mains={mains} classes={classes} search={search} />}
      {activeTab === 'notes' && <NotesManager mains={mains} classes={classes} notes={notes} search={search} />}
    </div>
  );
}

function MainsManager({ mains, search }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ id: null, title: '', description: '', image_url: '' });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const maxOrder = Math.max(0, ...mains.map((m) => m.order_index ?? 0));
      const { data, error } = await supabase
        .from('mains')
        .insert({ ...payload, order_index: maxOrder + 1 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Main created');
      queryClient.invalidateQueries(['admin-all']);
      setForm({ id: null, title: '', description: '', image_url: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { error } = await supabase.from('mains').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Main updated');
      queryClient.invalidateQueries(['admin-all']);
      setForm({ id: null, title: '', description: '', image_url: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('mains').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Main deleted');
      queryClient.invalidateQueries(['admin-all']);
    },
    onError: (e) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const updates = newOrder.map((m, idx) => ({ id: m.id, order_index: idx + 1 }));
      const promises = updates.map((u) => supabase.from('mains').update({ order_index: u.order_index }).eq('id', u.id));
      const results = await Promise.all(promises);
      const errs = results.find((r) => r.error);
      if (errs) throw errs.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all']);
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = useMemo(
    () => mains.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())),
    [mains, search]
  );

  function onEdit(m) {
    setForm({ id: m.id, title: m.title, description: m.description ?? '', image_url: m.image_url ?? '' });
  }

  function move(id, dir) {
    const arr = reorderList(filtered, id, dir);
    reorderMutation.mutate(arr);
  }

  return (
    <div className="grid md:grid-cols-[1fr_1fr] gap-6">
      <div className="rounded border bg-white dark:bg-slate-900 p-4">
        <div className="font-semibold mb-3">Create / Edit Main</div>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Title</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Image</label>
            <ImageUploader value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
          </div>
          <div className="flex gap-2">
            {form.id ? (
              <>
                <Button onClick={() => updateMutation.mutate(form)} disabled={!form.title.trim()}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setForm({ id: null, title: '', description: '', image_url: '' })}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => createMutation.mutate({ title: form.title, description: form.description, image_url: form.image_url })} disabled={!form.title.trim()}>
                Create
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded border bg-white dark:bg-slate-900 p-4">
        <div className="font-semibold mb-3">Mains</div>
        <ul className="space-y-2">
          {filtered.map((m, i) => (
            <li key={m.id} className="p-3 rounded border flex items-center gap-2">
              <div className="flex-1">
                <div className="font-medium">{m.title}</div>
                {m.description && <div className="text-xs text-slate-500">{m.description}</div>}
              </div>
              <button onClick={() => move(m.id, 'up')} disabled={i === 0} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => move(m.id, 'down')}
                disabled={i === filtered.length - 1}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowDown size={16} />
              </button>
              <button onClick={() => onEdit(m)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <Edit size={16} />
              </button>
              <button onClick={() => deleteMutation.mutate(m.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ClassesManager({ mains, classes, search }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    id: null,
    title: '',
    description: '',
    main_id: '',
    parent_class_id: '',
  });

  const topLevelClasses = useMemo(
    () => classes.filter((c) => !!c.main_id && !c.parent_class_id),
    [classes]
  );

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const siblings = classes.filter((c) =>
        payload.parent_class_id ? c.parent_class_id === payload.parent_class_id : c.main_id === payload.main_id
      );
      const maxOrder = Math.max(0, ...siblings.map((c) => c.order_index ?? 0));
      const { data, error } = await supabase
        .from('classes')
        .insert({ ...payload, order_index: maxOrder + 1 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Class created');
      queryClient.invalidateQueries(['admin-all']);
      setForm({ id: null, title: '', description: '', main_id: '', parent_class_id: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { error } = await supabase.from('classes').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Class updated');
      queryClient.invalidateQueries(['admin-all']);
      setForm({ id: null, title: '', description: '', main_id: '', parent_class_id: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Class deleted');
      queryClient.invalidateQueries(['admin-all']);
    },
    onError: (e) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ siblings }) => {
      const updates = siblings.map((c, idx) => ({ id: c.id, order_index: idx + 1 }));
      const promises = updates.map((u) => supabase.from('classes').update({ order_index: u.order_index }).eq('id', u.id));
      const res = await Promise.all(promises);
      const err = res.find((r) => r.error);
      if (err) throw err.error;
    },
    onSuccess: () => queryClient.invalidateQueries(['admin-all']),
    onError: (e) => toast.error(e.message),
  });

  const filtered = useMemo(
    () => classes.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())),
    [classes, search]
  );

  function onEdit(c) {
    setForm({
      id: c.id,
      title: c.title,
      description: c.description ?? '',
      main_id: c.main_id ?? '',
      parent_class_id: c.parent_class_id ?? '',
    });
  }

  function activeSiblings(c) {
    return filtered.filter((x) =>
      c.parent_class_id ? x.parent_class_id === c.parent_class_id : x.main_id === c.main_id
    );
  }

  function move(c, dir) {
    const siblings = activeSiblings(c);
    const arr = reorderList(siblings, c.id, dir);
    reorderMutation.mutate({ siblings: arr });
  }

  function onSubmitCreate() {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      description: form.description,
      main_id: form.parent_class_id ? null : form.main_id || null,
      parent_class_id: form.parent_class_id || null,
    };
    createMutation.mutate(payload);
  }

  function onSubmitUpdate() {
    const payload = {
      id: form.id,
      title: form.title,
      description: form.description,
      main_id: form.parent_class_id ? null : form.main_id || null,
      parent_class_id: form.parent_class_id || null,
    };
    updateMutation.mutate(payload);
  }

  return (
    <div className="grid md:grid-cols-[1fr_1fr] gap-6">
      <div className="rounded border bg-white dark:bg-slate-900 p-4">
        <div className="font-semibold mb-3">Create / Edit Class</div>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Title</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Under Main</label>
              <Select
                value={form.main_id}
                onChange={(e) => setForm((f) => ({ ...f, main_id: e.target.value, parent_class_id: '' }))}
              >
                <option value="">None</option>
                {mains.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm">Under Class</label>
              <Select
                value={form.parent_class_id}
                onChange={(e) => setForm((f) => ({ ...f, parent_class_id: e.target.value, main_id: '' }))}
              >
                <option value="">None</option>
                {topLevelClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            {form.id ? (
              <>
                <Button onClick={onSubmitUpdate} disabled={!form.title.trim()}>
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setForm({ id: null, title: '', description: '', main_id: '', parent_class_id: '' })}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={onSubmitCreate} disabled={!form.title.trim()}>
                Create
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded border bg-white dark:bg-slate-900 p-4">
        <div className="font-semibold mb-3">Classes</div>
        <ul className="space-y-2">
          {filtered.map((c, i) => (
            <li key={c.id} className="p-3 rounded border flex items-center gap-2">
              <div className="flex-1">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-slate-500">
                  {c.parent_class_id ? 'Nested under class' : 'Under main'}
                </div>
              </div>
              <button onClick={() => move(c, 'up')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowUp size={16} />
              </button>
              <button onClick={() => move(c, 'down')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowDown size={16} />
              </button>
              <button onClick={() => onEdit(c)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <Edit size={16} />
              </button>
              <DeleteButton onConfirm={() => deleteMutation.mutate(c.id)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NotesManager({ mains, classes, notes, search }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    id: null,
    title: '',
    body: '',
    bible_reference: '',
    image_url: '',
    main_id: '',
    class_id: '',
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const siblings = notes.filter((n) =>
        payload.class_id ? n.class_id === payload.class_id : n.main_id === payload.main_id
      );
      const maxOrder = Math.max(0, ...siblings.map((n) => n.order_index ?? 0));
      const { data, error } = await supabase
        .from('notes')
        .insert({ ...payload, order_index: maxOrder + 1 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Note created');
      queryClient.invalidateQueries(['admin-all']);
      setForm({
        id: null,
        title: '',
        body: '',
        bible_reference: '',
        image_url: '',
        main_id: '',
        class_id: '',
      });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { error } = await supabase.from('notes').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note updated');
      queryClient.invalidateQueries(['admin-all']);
      setForm({
        id: null,
        title: '',
        body: '',
        bible_reference: '',
        image_url: '',
        main_id: '',
        class_id: '',
      });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note deleted');
      queryClient.invalidateQueries(['admin-all']);
    },
    onError: (e) => toast.error(e.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ siblings }) => {
      const updates = siblings.map((n, idx) => ({ id: n.id, order_index: idx + 1 }));
      const promises = updates.map((u) => supabase.from('notes').update({ order_index: u.order_index }).eq('id', u.id));
      const res = await Promise.all(promises);
      const err = res.find((r) => r.error);
      if (err) throw err.error;
    },
    onSuccess: () => queryClient.invalidateQueries(['admin-all']),
    onError: (e) => toast.error(e.message),
  });

  const filtered = useMemo(
    () => notes.filter((n) => (n.title + ' ' + n.body).toLowerCase().includes(search.toLowerCase())),
    [notes, search]
  );

  function onEdit(n) {
    setForm({
      id: n.id,
      title: n.title,
      body: n.body,
      bible_reference: n.bible_reference ?? '',
      image_url: n.image_url ?? '',
      main_id: n.main_id ?? '',
      class_id: n.class_id ?? '',
    });
  }

  function activeSiblings(n) {
    return filtered.filter((x) => (n.class_id ? x.class_id === n.class_id : x.main_id === n.main_id));
  }

  function move(n, dir) {
    const siblings = activeSiblings(n);
    const arr = reorderList(siblings, n.id, dir);
    reorderMutation.mutate({ siblings: arr });
  }

  function onSubmitCreate() {
    if (!form.title.trim() || !form.body.trim()) return;
    const payload = {
      title: form.title,
      body: form.body,
      bible_reference: form.bible_reference || null,
      image_url: form.image_url || null,
      main_id: form.class_id ? null : form.main_id || null,
      class_id: form.class_id || null,
    };
    createMutation.mutate(payload);
  }

  function onSubmitUpdate() {
    const payload = {
      id: form.id,
      title: form.title,
      body: form.body,
      bible_reference: form.bible_reference || null,
      image_url: form.image_url || null,
      main_id: form.class_id ? null : form.main_id || null,
      class_id: form.class_id || null,
    };
    updateMutation.mutate(payload);
  }

  return (
    <div className="grid md:grid-cols-[1fr_1fr] gap-6">
      <div className="rounded border bg-white dark:bg-slate-900 p-4">
        <div className="font-semibold mb-3">Create / Edit Note</div>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Title</label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Bible Reference (optional)</label>
            <Input
              placeholder="e.g., John 3:16–18"
              value={form.bible_reference}
              onChange={(e) => setForm((f) => ({ ...f, bible_reference: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm">Body (Markdown supported)</label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Use Markdown syntax..."
            />
          </div>
          <div>
            <label className="text-sm">Image</label>
            <ImageUploader value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Under Main</label>
              <Select
                value={form.main_id}
                onChange={(e) => setForm((f) => ({ ...f, main_id: e.target.value, class_id: '' }))}
              >
                <option value="">None</option>
                {mains.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm">Under Class</label>
              <Select
                value={form.class_id}
                onChange={(e) => setForm((f) => ({ ...f, class_id: e.target.value, main_id: '' }))}
              >
                <option value="">None</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            {form.id ? (
              <>
                <Button onClick={onSubmitUpdate} disabled={!form.title.trim() || !form.body.trim()}>
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setForm({
                      id: null,
                      title: '',
                      body: '',
                      bible_reference: '',
                      image_url: '',
                      main_id: '',
                      class_id: '',
                    })
                  }
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={onSubmitCreate} disabled={!form.title.trim() || !form.body.trim()}>
                Create
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded border bg-white dark:bg-slate-900 p-4">
        <div className="font-semibold mb-3">Notes</div>
        <ul className="space-y-2">
          {filtered.map((n, i) => (
            <li key={n.id} className="p-3 rounded border">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-medium">{n.title}</div>
                  {n.bible_reference && (
                    <div className="text-xs text-slate-500">Ref: {n.bible_reference}</div>
                  )}
                </div>
                <button onClick={() => move(n, 'up')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => move(n, 'down')}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowDown size={16} />
                </button>
                <button onClick={() => onEdit(n)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Edit size={16} />
                </button>
                <DeleteButton onConfirm={() => deleteMutation.mutate(n.id)} />
              </div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-2">{n.body}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DeleteButton({ onConfirm }) {
  const [busy, setBusy] = useState(false);
  async function handle() {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  }
  return (
    <button
      onClick={handle}
      disabled={busy}
      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  );
}
