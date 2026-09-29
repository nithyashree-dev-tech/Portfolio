import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { projects as fallbackProjects } from '../data/mockData';
import { projectService } from '../services/api';
import type { Project } from '../types';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);

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

    void loadProjects();
  }, []);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Projects"
        title="Selected projects that reflect practical engineering and problem solving"
        description="A portfolio of application work focused on AI, cloud, APIs, and data workflows."
      />

      <div className="projects-grid">
        {projects.map((project) => (
          <article key={project.slug} className="card project-card">
            {project.image ? <img src={project.image} alt={project.title} loading="lazy" /> : null}
            <div className="card-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.technologies.length ? <div className="chip-list">
                {project.technologies.map((tech) => (
                  <span key={`${project.slug}-${tech}`} className="chip">{tech}</span>
                ))}
              </div> : null}
              <div className="project-actions">
                {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
                {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noreferrer">Live Demo</a> : null}
                <Link to={`/projects/${project.slug}`}>View Details</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Projects;
