import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase.js';
import NoteRenderer from '../../components/Content/NoteRenderer.jsx';
import PDFExportButton from '../../components/Content/PDFExportButton.jsx';
import { Skeleton } from '../../components/UI/Skeleton.jsx';

export default function NotePage() {
  const { noteId } = useParams();

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const { data, error } = await supabase.from('notes').select('*').eq('id', noteId).single();
      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} • Bible Study`;
    }
  }, [note?.title]);

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!note) {
    return <div>Note not found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <PDFExportButton title={note.title} body={note.body} filename={`${note.title}.pdf`} />
      </div>
      <NoteRenderer
        title={note.title}
        body={note.body}
        imageUrl={note.image_url}
        bibleReference={note.bible_reference}
      />
    </div>
  );
}
