// components/ImageUpload.tsx
import { useState } from 'react';

export default function ImageUpload() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;
  
    try {
      // Compress image if over 1MB
      let processedFile = file;
      if (file.size > 1024 * 1024) { // 1MB threshold
        processedFile = await compressImage(file, {
          quality: 0.7,
          maxWidth: 1024
        });
      }
  
      const base64Image = await toBase64(processedFile);
      
      const response = await fetch('https://air-quality-back-end-v2.vercel.app/blob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image: base64Image,
          contentType: processedFile.type,
        }),
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      const data = await response.json();
      console.log('Uploaded:', data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  // Add these helper functions
  async function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  
  async function compressImage(file: File, options: { quality: number; maxWidth: number }): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(options.maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: file.type }));
        }, file.type, options.quality);
      };
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '20px auto' }}>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Image name"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError('');
          }}
          style={{ width: '100%' }}
        />
        {file && (
          <p style={{ fontSize: '0.8em', color: '#666' }}>
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      <button 
        type="submit" 
        disabled={isUploading}
        style={{
          padding: '8px 16px',
          background: isUploading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isUploading ? 'not-allowed' : 'pointer'
        }}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}