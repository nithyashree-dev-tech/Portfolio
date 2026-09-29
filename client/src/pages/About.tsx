import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { profileService } from '../services/api';
import type { Profile } from '../types';

const About = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    void profileService.get().then((response) => setProfile(response.data)).catch(() => undefined);
  }, []);

  return (
  <div className="page container">
    <SectionHeader
      eyebrow="About"
      title={profile?.professionalTitle || 'Building reliable systems and data-driven digital experiences'}
      description={profile?.longBio || 'I am a B.Tech AI & Data Science engineering student with a strong interest in cloud computing, Linux system administration, networking, cybersecurity, and scalable technology solutions.'}
    />

    <div className="about-grid two-column">
      <div className="card">
        <h3>Professional Introduction</h3>
        <p>
          {profile?.shortBio || 'I enjoy solving real-world technical problems through automation, infrastructure understanding, and data-informed decision-making. My focus is on building secure, reliable systems that scale smoothly while maintaining clear performance and operational visibility.'}
        </p>
      </div>
      <div className="card">
        <h3>Education</h3>
        <p><strong>B.Tech AI & Data Science</strong></p>
        <p>Jayalakshmi Institute of Technology</p>
        <p>CGPA: 8.8</p>
      </div>
    </div>

    <div className="timeline stacked">
      <div className="timeline-item card">
        <span className="timeline-year">Current</span>
        <div>
          <h3>Career Interests</h3>
          <p>Cloud engineering, Linux administration, network operations, cybersecurity, data analytics, and full-stack system problem solving.</p>
        </div>
      </div>
      <div className="timeline-item card">
        <span className="timeline-year">Learning</span>
        <div>
          <h3>Technical Interests</h3>
          <p>Cloud infrastructure, secure deployment practices, system automation, networking fundamentals, and data-driven insights.</p>
        </div>
      </div>
      <div className="timeline-item card">
        <span className="timeline-year">Strength</span>
        <div>
          <h3>Strengths</h3>
          <p>Curious mindset, analytical thinking, structured learning, problem solving, and a strong desire to build practical technology solutions.</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default About;
