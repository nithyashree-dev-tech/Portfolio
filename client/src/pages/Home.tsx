import { useEffect, useState } from 'react';
import { ArrowRight, Download, GitBranch, Mail, BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';
import { projects as fallbackProjects } from '../data/mockData';
import { profileService, projectService } from '../services/api';
import type { Profile, Project } from '../types';
import { getPageField } from '../data/pageContent';

const Home = () => {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectService.getAll();
        if (response.data?.length) {
          setProjects(response.data);
        }
      } catch (error) {
        console.warn('Using fallback project data:', error);
      }
    };

    const loadProfile = async () => {
      try {
        const response = await profileService.get();
        setProfile(response.data);
      } catch (error) {
        console.warn('Using fallback profile data:', error);
      }
    };

    void loadProjects();
    void loadProfile();
  }, []);

  const featuredProject = projects[0] ?? fallbackProjects[0];
  const profileImageUrl = profile?.profileImageFileId
    ? `${API_BASE_URL}/profile/photo/${profile.profileImageFileId}`
    : profile?.profileImage || '';
  const homeFeatures = ['focus', 'skills', 'approach']
    .map((id) => getPageField(profile, 'home', id))
    .filter((field): field is NonNullable<typeof field> => Boolean(field && field.label.trim() && field.value.trim()));

  return (
    <div className="page home-page">
      <section className="hero-section container" id="home">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="eyebrow">{profile?.professionalTitle || 'AI & Data Science Engineer'}</p>
          <h1>{profile?.name || 'M Nithya Shree'}</h1>
          <h2>{profile?.professionalTitle || 'AI & Data Science Engineer | Cloud & Linux Enthusiast'}</h2>
          <p className="lead">{profile?.shortBio || 'Building reliable, scalable and secure technology solutions while continuously developing expertise in cloud computing, Linux administration, networking and data analytics.'}</p>
          <div className="hero-actions">
            <Link to="/projects" className="button primary">
              View Projects <ArrowRight size={16} />
            </Link>
            <Link to="/resume" className="button secondary">
              <Download size={16} /> Download Resume
            </Link>
            <Link to="/contact" className="button ghost">
              Contact Me
            </Link>
          </div>
          <div className="social-links" aria-label="Social profiles">
            <a href={profile?.githubUrl || 'https://github.com'} target="_blank" rel="noreferrer" aria-label="GitHub"><GitBranch size={18} /></a>
            <a href={profile?.linkedinUrl || 'https://linkedin.com'} target="_blank" rel="noreferrer" aria-label="LinkedIn"><BriefcaseBusiness size={18} /></a>
            <a href={`mailto:${profile?.email || 'nithyashree@example.com'}`} aria-label="Email"><Mail size={18} /></a>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="profile-photo-wrap">
            {profileImageUrl ? (
              <img className="profile-photo" src={profileImageUrl} alt={profile?.name || 'Portfolio owner'} />
            ) : (
              <div className="profile-photo profile-photo-placeholder" aria-label="Profile photo placeholder">
                <span>{(profile?.name || 'M Nithya Shree').split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>
              </div>
            )}
            <div className="profile-photo-caption">
              <span>{profile?.professionalTitle || 'AI & Data Science Engineer'}</span>
              <span>Cloud · Linux · Data</span>
            </div>
          </div>
        </motion.div>
      </section>

      {homeFeatures.length ? (
        <section className="container feature-panel">
          {homeFeatures.map((field) => (
            <div key={field.id} className="feature-box">
              <strong>{field.label}</strong>
              <span>{field.value}</span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="container section-block">
        <div className="section-head-row">
          <h3>Featured Project</h3>
          <Link to="/projects">View all projects</Link>
        </div>
        <article className="project-highlight card">
          <img src={featuredProject.image} alt={featuredProject.title} />
          <div>
            <p className="eyebrow">Selected Work</p>
            <h3>{featuredProject.title}</h3>
            <p>{featuredProject.description}</p>
            <div className="chip-list">
              {featuredProject.technologies.slice(0, 5).map((tech) => (
                <span key={tech} className="chip">{tech}</span>
              ))}
            </div>
            <Link to={`/projects/${featuredProject.slug}`} className="button primary small">
              View Details
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Home;
