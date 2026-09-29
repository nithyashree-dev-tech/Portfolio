import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { experience as fallbackExperience } from '../data/mockData';
import { experienceService } from '../services/api';
import type { ExperienceItem } from '../types';

const Experience = () => {
  const [experience, setExperience] = useState<ExperienceItem[]>(fallbackExperience);

  useEffect(() => {
    const loadExperience = async () => {
      try {
        const response = await experienceService.getAll();
        if (response.data?.length) {
          setExperience(response.data);
        }
      } catch (error) {
        console.warn('Using fallback experience data:', error);
      }
    };

    void loadExperience();
  }, []);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Experience & Activities"
        title="Academic growth, technical training and technology exposure"
        description="Focused on applied learning, project work, leadership, and technical activities that build practical capability."
      />

      <div className="timeline stacked">
        {experience.map((item) => (
          <div key={`${item.organization}-${item.role}`} className="timeline-item card">
            <span className="timeline-year">{item.startDate.slice(0, 4)} - {item.endDate?.slice(0, 4) ?? 'Present'}</span>
            <div>
              <h3>{item.role}</h3>
              <p className="muted">{item.organization}</p>
              <p>{item.description}</p>
              <div className="chip-list">
                {item.technologies.map((tech) => <span key={`${item.role}-${tech}`} className="chip">{tech}</span>)}
              </div>
              <ul>
                {item.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experience;
