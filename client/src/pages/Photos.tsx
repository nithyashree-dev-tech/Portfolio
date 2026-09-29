import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { galleryService } from '../services/api';
import type { GalleryPhoto } from '../types';

const Photos = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    galleryService.getAll()
      .then((response) => setPhotos(response.data))
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Unable to load photos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page container photos-page">
      <SectionHeader
        eyebrow="Photo Journal"
        title="Moments, places and details"
        description="A small collection of moments from my work and everyday life."
      />

      {loading ? <p className="muted">Loading photos...</p> : null}
      {error ? <p className="form-feedback error">{error}</p> : null}
      {!loading && !error && photos.length === 0 ? (
        <p className="card resume-empty">Photos will appear here soon.</p>
      ) : null}
      {photos.length ? (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <figure className="gallery-photo" key={photo._id}>
              <a href={photo.imageUrl} target="_blank" rel="noreferrer" aria-label={`Open full-size photo: ${photo.title}`}>
                <img src={photo.imageUrl} alt={photo.title} loading="lazy" decoding="async" />
                <span className="gallery-open" aria-hidden="true"><ExternalLink size={16} /></span>
              </a>
              {(photo.title || photo.caption) ? (
                <figcaption>
                  {photo.title ? <h2>{photo.title}</h2> : null}
                  {photo.caption ? <p>{photo.caption}</p> : null}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Photos;