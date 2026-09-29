import { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { API_BASE_URL, profileService } from '../services/api';
import type { Profile } from '../types';

const resumeOptions = [
  { role: 'cloud', label: 'Cloud Engineering', field: 'cloudResumeUrl' as const },
  { role: 'software', label: 'Software Engineering', field: 'softwareResumeUrl' as const },
];

const Resume = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService.get()
      .then((response) => setProfile(response.data))
      .catch((error: unknown) => console.warn('Unable to load resumes:', error))
      .finally(() => setLoading(false));
  }, []);

  const availableResumes = resumeOptions.filter(({ field }) => profile?.[field]);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Resume"
        title="Choose a resume for the role"
        description="Download the version tailored to the opportunity you are exploring."
      />

      {loading ? (
        <p className="card resume-empty">Loading resumes...</p>
      ) : availableResumes.length ? (
        <div className="resume-grid">
          {availableResumes.map(({ role, label, field }) => {
            const previewUrl = new URL(profile![field]!, API_BASE_URL).toString();
            return (
              <article className="card resume-option" key={role}>
                <div className="resume-option-heading">
                  <span className="resume-icon"><FileText size={22} /></span>
                  <div>
                    <p className="eyebrow">Tailored Resume</p>
                    <h2>{label}</h2>
                  </div>
                </div>
                <div className="resume-actions">
                  <a className="button primary" href={`${API_BASE_URL}/profile/resumes/${role}/download`}>
                    <Download size={16} /> Download PDF
                  </a>
                  <a className="button secondary" href={previewUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} /> Preview
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="card resume-empty">No resumes have been uploaded yet.</p>
      )}
    </div>
  );
};

export default Resume;
