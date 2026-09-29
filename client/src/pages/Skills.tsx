import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { skills as fallbackSkills } from '../data/mockData';
import { skillService } from '../services/api';
import type { Skill } from '../types';

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>(fallbackSkills);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await skillService.getAll();
        if (response.data?.length) {
          setSkills(response.data);
        }
      } catch (error) {
        console.warn('Using fallback skills data:', error);
      }
    };

    void loadSkills();
  }, []);

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    acc[skill.category] = acc[skill.category] ? [...acc[skill.category], skill] : [skill];
    return acc;
  }, {});

  const skillGroups = Object.entries(grouped);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Skills"
        title="Technology expertise across infrastructure, data and product engineering"
        description="Skills are organized by domain and categorized by practical experience level."
      />

      <div className="skills-grid">
        {skillGroups.map(([category, items]) => (
          <section key={category} className="card skill-group">
            <h3>{category}</h3>
            <div className="skill-list">
              {items.map((skill) => (
                <div key={skill.name} className="skill-item">
                  <span>{skill.name}</span>
                  <small>{skill.level}</small>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Skills;
