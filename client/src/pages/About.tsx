import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { profileService } from '../services/api';
import type { Profile } from '../types';
import { getPageFieldValue } from '../data/pageContent';

const About = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const aboutTitle = getPageFieldValue(profile, 'about', 'title', '');
  const aboutDescription = getPageFieldValue(profile, 'about', 'description', '');
  const introTitle = getPageFieldValue(profile, 'about', 'introTitle', '');
  const introText = getPageFieldValue(profile, 'about', 'introText', '');
  const educationTitle = getPageFieldValue(profile, 'about', 'educationTitle', '');
  const educationProgram = getPageFieldValue(profile, 'about', 'educationProgram', '');
  const educationInstitution = getPageFieldValue(profile, 'about', 'educationInstitution', '');
  const educationScore = getPageFieldValue(profile, 'about', 'educationScore', '');
  const careerTitle = getPageFieldValue(profile, 'about', 'careerTitle', '');
  const careerText = getPageFieldValue(profile, 'about', 'careerText', '');
  const technicalTitle = getPageFieldValue(profile, 'about', 'technicalTitle', '');
  const technicalText = getPageFieldValue(profile, 'about', 'technicalText', '');
  const strengthsTitle = getPageFieldValue(profile, 'about', 'strengthsTitle', '');
  const strengthsText = getPageFieldValue(profile, 'about', 'strengthsText', '');

  useEffect(() => {
    void profileService.get().then((response) => setProfile(response.data)).catch(() => undefined);
  }, []);

  return (
  <div className="page container">
    {aboutTitle || aboutDescription ? (
      <SectionHeader eyebrow="About" title={aboutTitle} description={aboutDescription} />
    ) : null}

    {introTitle || introText || educationTitle || educationProgram || educationInstitution || educationScore ? (
      <div className="about-grid two-column">
        {introTitle || introText ? (
          <div className="card">
            {introTitle ? <h3>{introTitle}</h3> : null}
            {introText ? <p>{introText}</p> : null}
          </div>
        ) : null}
        {educationTitle || educationProgram || educationInstitution || educationScore ? (
          <div className="card">
            {educationTitle ? <h3>{educationTitle}</h3> : null}
            {educationProgram ? <p><strong>{educationProgram}</strong></p> : null}
            {educationInstitution ? <p>{educationInstitution}</p> : null}
            {educationScore ? <p>{educationScore}</p> : null}
          </div>
        ) : null}
      </div>
    ) : null}

    {careerTitle || careerText || technicalTitle || technicalText || strengthsTitle || strengthsText ? (
      <div className="timeline stacked">
        {careerTitle || careerText ? (
          <div className="timeline-item card">
            <span className="timeline-year">Current</span>
            <div>
              {careerTitle ? <h3>{careerTitle}</h3> : null}
              {careerText ? <p>{careerText}</p> : null}
            </div>
          </div>
        ) : null}
        {technicalTitle || technicalText ? (
          <div className="timeline-item card">
            <span className="timeline-year">Learning</span>
            <div>
              {technicalTitle ? <h3>{technicalTitle}</h3> : null}
              {technicalText ? <p>{technicalText}</p> : null}
            </div>
          </div>
        ) : null}
        {strengthsTitle || strengthsText ? (
          <div className="timeline-item card">
            <span className="timeline-year">Strength</span>
            <div>
              {strengthsTitle ? <h3>{strengthsTitle}</h3> : null}
              {strengthsText ? <p>{strengthsText}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    ) : null}
  </div>
  );
};

export default About;
