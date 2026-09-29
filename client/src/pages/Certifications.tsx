import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { certifications as fallbackCertifications } from '../data/mockData';
import { certificationService } from '../services/api';
import type { Certification } from '../types';

const Certifications = () => {
  const [certifications, setCertifications] = useState<Certification[]>(fallbackCertifications);

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        const response = await certificationService.getAll();
        if (response.data?.length) {
          setCertifications(response.data);
        }
      } catch (error) {
        console.warn('Using fallback certifications data:', error);
      }
    };

    void loadCertifications();
  }, []);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Certifications"
        title="Professional learning and technical validation"
        description="Credentials that reflect continued growth in cloud and modern technology practices."
      />

      <div className="cert-grid">
        {certifications.map((cert) => (
          <article key={cert.title} className="card cert-card">
            <img src={cert.certificateImage} alt={cert.title} />
            <div>
              <h3>{cert.title}</h3>
              <p>{cert.issuer}</p>
              <p>{cert.issueDate}</p>
              {cert.credentialId ? <p>Credential ID: {cert.credentialId}</p> : null}
              <a href={cert.credentialUrl} target="_blank" rel="noreferrer">View Credential</a>
              <div className="chip-list">
                {cert.skills.map((skill) => <span key={`${cert.title}-${skill}`} className="chip">{skill}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Certifications;
