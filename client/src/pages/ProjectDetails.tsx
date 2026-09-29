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

  const hasText = (value?: string) => Boolean(value?.trim());
  const hasItems = (values?: string[]) => Boolean(values?.some((value) => value.trim()));

  return (
    <div className="page container project-details">
      <Link to="/projects" className="back-link">← Back to projects</Link>
      <article className="card details-card">
        {project.image ? <img src={project.image} alt={project.title} className="detail-image" /> : null}
        <div className="detail-copy">
          <p className="eyebrow">Featured Project</p>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          {(project.startDate || project.endDate) ? <p className="muted">{[project.startDate, project.endDate].filter(Boolean).join(' — ')}</p> : null}
          <div className="project-actions">
            {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
            {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noreferrer">Live demo</a> : null}
          </div>
          {project.technologies.length ? <div className="chip-list">
            {project.technologies.map((tech) => (
              <span key={tech} className="chip">{tech}</span>
            ))}
          </div> : null}

          {hasText(project.longDescription) ? <p>{project.longDescription}</p> : null}
          {hasText(project.problem) ? <section><h3>Problem</h3><p>{project.problem}</p></section> : null}
          {hasText(project.solution) ? <section><h3>Solution</h3><p>{project.solution}</p></section> : null}
          {hasItems(project.features) ? <section><h3>Features</h3><ul>{project.features.filter((feature) => feature.trim()).map((feature) => <li key={feature}>{feature}</li>)}</ul></section> : null}
          {hasText(project.architecture) ? <section><h3>Architecture</h3><p>{project.architecture}</p></section> : null}
          {hasText(project.auth) ? <section><h3>Authentication</h3><p>{project.auth}</p></section> : null}
          {hasText(project.database) ? <section><h3>Database</h3><p>{project.database}</p></section> : null}
          {hasText(project.aiIntegration) ? <section><h3>AI integration</h3><p>{project.aiIntegration}</p></section> : null}
          {hasItems(project.challenges) ? <section><h3>Challenges</h3><ul>{project.challenges?.filter((challenge) => challenge.trim()).map((challenge) => <li key={challenge}>{challenge}</li>)}</ul></section> : null}
          {hasItems(project.futureImprovements) ? <section><h3>Future improvements</h3><ul>{project.futureImprovements?.filter((item) => item.trim()).map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
        </div>
      </article>
    </div>
  );
};

export default ProjectDetails;
