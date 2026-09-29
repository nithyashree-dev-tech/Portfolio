import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageFields, RESERVED_PAGE_FIELD_IDS } from '../data/pageContent';
import { profileService } from '../services/api';
import type { Profile } from '../types';

const PageCustomFields = () => {
  const { pathname } = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const page = pathname === '/' ? 'home' : pathname.split('/')[1];

  useEffect(() => {
    let active = true;
    void profileService.get()
      .then((response) => { if (active) setProfile(response.data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [page]);

  if (pathname.startsWith('/admin/')) return null;
  const fields = getPageFields(profile, page).filter((field) =>
    !RESERVED_PAGE_FIELD_IDS.has(field.id) && field.label.trim() && field.value.trim(),
  );
  if (!fields.length) return null;

  return (
    <section className="container section-block page-custom-fields" aria-label="Additional page information">
      {fields.map((field) => (
        <article key={field.id} className="page-custom-field">
          <h2>{field.label}</h2>
          <p>{field.value}</p>
        </article>
      ))}
    </section>
  );
};

export default PageCustomFields;