import React, { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../UI/Button.jsx';

export default function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(data.path);
    onChange(publicUrl.publicUrl);
    toast.success('Image uploaded');
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-3">
          <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded border" />
          <Button variant="outline" size="sm" onClick={() => onChange('')}>
            Remove
          </Button>
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <UploadCloud size={16} className="mr-2" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>
    </div>
  );
}
