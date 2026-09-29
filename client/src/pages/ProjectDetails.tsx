import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projects as fallbackProjects } from '../data/mockData';
import { projectService } from '../services/api';
import type { Project } from '../types';

const ProjectDetails = () => {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(fallbackProjects.find((item) => item.slug === slug) ?? fallbackProjects[0] ?? null);

  useEffect(() => {
    const loadProject = async () => {
      if (!slug) {
        return;
      }

      try {
        const response = await projectService.getBySlug(slug);
        setProject(response.data || null);
      } catch (error) {
        console.warn('Using fallback project data:', error);
        const fallbackProject = fallbackProjects.find((item) => item.slug === slug) ?? fallbackProjects[0] ?? null;
        setProject(fallbackProject);
      }
    };

    void loadProject();
  }, [slug]);

  if (!project) {
    return <div className="container page">Project not found.</div>;
  }

  return (
    <div className="page container project-details">
      <Link to="/projects" className="back-link">← Back to projects</Link>
      <article className="card details-card">
        <img src={project.image} alt={project.title} className="detail-image" />
        <div className="detail-copy">
          <p className="eyebrow">Featured Project</p>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="chip-list">
            {project.technologies.map((tech) => (
              <span key={tech} className="chip">{tech}</span>
            ))}
          </div>

          <section>
            <h3>Problem</h3>
            <p>{project.problem}</p>
          </section>
          <section>
            <h3>Solution</h3>
            <p>{project.solution}</p>
          </section>
          <section>
            <h3>Features</h3>
            <ul>
              {project.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </section>
          <section>
            <h3>Architecture</h3>
            <p>{project.architecture}</p>
          </section>
          <section>
            <h3>Authentication</h3>
            <p>{project.auth}</p>
          </section>
          <section>
            <h3>Database</h3>
            <p>{project.database}</p>
          </section>
          <section>
            <h3>AI integration</h3>
            <p>{project.aiIntegration}</p>
          </section>
          <section>
            <h3>Challenges</h3>
            <ul>
              {project.challenges?.map((challenge) => <li key={challenge}>{challenge}</li>)}
            </ul>
          </section>
          <section>
            <h3>Future improvements</h3>
            <ul>
              {project.futureImprovements?.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
};

export default ProjectDetails;
