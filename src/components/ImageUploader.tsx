'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload convert to base64 instead of Supabase Storage to avoid bucket configs
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      onUpload(base64data);
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
      style={{
        border: dragActive ? '2px dashed #D4AF37' : '2px dashed #555',
        padding: '1rem',
        textAlign: 'center',
        borderRadius: '8px',
        background: '#0a0a0f',
        color: '#9ca3af',
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      {preview ? (
        <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
      ) : (
        <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
      )}
    </div>
  );
}
