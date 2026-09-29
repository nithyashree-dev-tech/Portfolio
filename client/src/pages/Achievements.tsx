import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { achievements as fallbackAchievements } from '../data/mockData';
import { achievementService } from '../services/api';
import type { Achievement } from '../types';

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(fallbackAchievements);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const response = await achievementService.getAll();
        if (response.data?.length) {
          setAchievements(response.data);
        }
      } catch (error) {
        console.warn('Using fallback achievements data:', error);
      }
    };

    void loadAchievements();
  }, []);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Achievements"
        title="Recognition through learning and technical engagement"
        description="A snapshot of milestones, participation, and learning outcomes relevant to a technology career."
      />

      <div className="achievement-grid">
        {achievements.map((achievement) => (
          <article key={achievement.title} className="card achievement-card">
            {achievement.image ? <img src={achievement.image} alt={achievement.title} /> : null}
            <div>
              <p className="eyebrow">{achievement.organization}</p>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <p className="muted">{achievement.date}</p>
              {achievement.link ? (
                <a href={achievement.link} target="_blank" rel="noreferrer">View link</a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
