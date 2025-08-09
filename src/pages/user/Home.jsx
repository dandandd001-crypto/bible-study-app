import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';
import { Button } from '../../components/UI/Button.jsx';
import { Skeleton } from '../../components/UI/Skeleton.jsx';

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['home-mains'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mains').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  React.useEffect(() => {
    document.title = 'Home • Bible Study';
  }, []);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((m) => (
          <div key={m.id} className="rounded-lg border bg-white dark:bg-slate-900 p-4 flex flex-col">
            {m.image_url && (
              <img src={m.image_url} alt={m.title} className="rounded mb-3 h-40 object-cover" loading="lazy" />
            )}
            <div className="font-semibold text-lg">{m.title}</div>
            {m.description && <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{m.description}</div>}
            <div className="mt-auto pt-3">
              <Link to="/" state={{ focusMainId: m.id }}>
                <Button variant="outline" size="sm">Open in TOC</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
