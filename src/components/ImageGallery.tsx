// components/ImageGallery.tsx
import { useEffect, useState } from 'react';

interface Blob {
  _id: string;
  name: string;
  image: string; // Base64
  contentType: string;
  createdAt: string;
}

export default function ImageGallery() {
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlobs = async () => {
      try {
        const response = await fetch('https://air-quality-back-end-v2.vercel.app/blob');
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const { data } = await response.json();
        setBlobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch images');
      } finally {
        setLoading(false);
      }
    };
    fetchBlobs();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '20px', 
      padding: '20px' 
    }}>
      {blobs.map((blob) => (
        <div key={blob._id} style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ marginTop: 0 }}>{blob.name}</h3>
          <img 
            src={blob.image} 
            alt={blob.name} 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              borderRadius: '4px'
            }}
          />
          <p style={{ 
            fontSize: '0.8em', 
            color: '#666', 
            marginTop: '10px' 
          }}>
            Uploaded: {new Date(blob.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}