import type { Achievement, Certification, ExperienceItem, Project, Skill } from '../types';

export const skills: Skill[] = [
  { name: 'Google Cloud', category: 'Cloud Computing', level: 'Hands-on' },
  { name: 'IAM', category: 'Cloud Computing', level: 'Hands-on' },
  { name: 'BigQuery', category: 'Cloud Computing', level: 'Working Knowledge' },
  { name: 'Dataflow', category: 'Cloud Computing', level: 'Working Knowledge' },
  { name: 'Dataproc', category: 'Cloud Computing', level: 'Working Knowledge' },
  { name: 'Cloud storage concepts', category: 'Cloud Computing', level: 'Hands-on' },
  { name: 'Red Hat Enterprise Linux', category: 'Linux & System Administration', level: 'Hands-on' },
  { name: 'CentOS', category: 'Linux & System Administration', level: 'Working Knowledge' },
  { name: 'Ubuntu', category: 'Linux & System Administration', level: 'Hands-on' },
  { name: 'SSH', category: 'Linux & System Administration', level: 'Hands-on' },
  { name: 'systemd', category: 'Linux & System Administration', level: 'Working Knowledge' },
  { name: 'User and group management', category: 'Linux & System Administration', level: 'Hands-on' },
  { name: 'File permissions', category: 'Linux & System Administration', level: 'Hands-on' },
  { name: 'Process management', category: 'Linux & System Administration', level: 'Hands-on' },
  { name: 'Bash', category: 'Linux & System Administration', level: 'Hands-on' },
  { name: 'Networking', category: 'Linux & System Administration', level: 'Working Knowledge' },
  { name: 'TCP/IP', category: 'Networking', level: 'Hands-on' },
  { name: 'IP addressing', category: 'Networking', level: 'Hands-on' },
  { name: 'Ports', category: 'Networking', level: 'Working Knowledge' },
  { name: 'DNS fundamentals', category: 'Networking', level: 'Working Knowledge' },
  { name: 'Network troubleshooting', category: 'Networking', level: 'Hands-on' },
  { name: 'Python', category: 'Programming & Development', level: 'Hands-on' },
  { name: 'JavaScript', category: 'Programming & Development', level: 'Hands-on' },
  { name: 'TypeScript', category: 'Programming & Development', level: 'Hands-on' },
  { name: 'Node.js', category: 'Programming & Development', level: 'Hands-on' },
  { name: 'Express.js', category: 'Programming & Development', level: 'Hands-on' },
  { name: 'React', category: 'Programming & Development', level: 'Hands-on' },
  { name: 'REST APIs', category: 'Programming & Development', level: 'Hands-on' },
  { name: 'MongoDB', category: 'Databases', level: 'Working Knowledge' },
  { name: 'MySQL', category: 'Databases', level: 'Familiar' },
  { name: 'SQL', category: 'Databases', level: 'Working Knowledge' },
  { name: 'Database fundamentals', category: 'Databases', level: 'Working Knowledge' },
  { name: 'Git', category: 'Tools', level: 'Hands-on' },
  { name: 'GitHub', category: 'Tools', level: 'Hands-on' },
  { name: 'Postman', category: 'Tools', level: 'Hands-on' },
  { name: 'Docker', category: 'Tools', level: 'Currently Learning' },
  { name: 'VMware', category: 'Tools', level: 'Familiar' },
];

export const projects: Project[] = [
  {
    _id: 'p1',
    title: 'AI Interview Preparation Assistant',
    slug: 'ai-interview-preparation-assistant',
    description:
      'An AI-powered interview preparation platform that generates interview questions and evaluates candidate responses using structured AI feedback.',
    longDescription:
      'This application helps users practice technical interviews by generating relevant questions, comparing responses to evaluation criteria, and improving their delivery through targeted AI insights.',
    technologies: ['React', 'Vite', 'Node.js', 'Express.js', 'MongoDB', 'OpenRouter API', 'JWT', 'Postman', 'Render'],
    features: ['AI question generation', 'Candidate response evaluation', 'Secure user authentication', 'Interview analytics dashboard'],
    githubUrl: 'https://github.com/example/ai-interview-prep',
    liveUrl: 'https://example.com/ai-interview-prep',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    problem: 'Candidates often struggle to practice structured technical interview preparation without personalized feedback.',
    solution: 'Built a web app that dynamically generates interview prompts and evaluates responses using AI-driven scoring and feedback loops.',
    architecture: 'Frontend React app with Node/Express API, MongoDB persistence, and AI integration via OpenRouter.',
    auth: 'JWT-based authentication for user sessions and protected features.',
    database: 'MongoDB stores users, interview records, and generated question history.',
    aiIntegration: 'OpenRouter API powers question generation and response analysis with contextual scoring.',
    challenges: ['Designing a useful scoring rubric', 'Keeping responses context-aware', 'Balancing AI speed and accuracy'],
    futureImprovements: ['Interview performance benchmarking', 'Resume-based personalization', 'Multi-user coaching workflows'],
  },
];

export const certifications: Certification[] = [
  {
    _id: 'c1',
    title: 'Google Cloud Skills Boost - Cloud Fundamentals',
    issuer: 'Google Cloud',
    issueDate: '2025-02-15',
    credentialId: 'GCP-SKILL-001',
    credentialUrl: 'https://www.cloudskillsboost.google/',
    certificateImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    skills: ['Google Cloud', 'IAM', 'Cloud concepts'],
  },
];

export const experience: ExperienceItem[] = [
  {
    organization: 'Jayalakshmi Institute of Technology',
    role: 'B.Tech AI & Data Science Student',
    description: 'Working on academic and technical projects focused on cloud, Linux, networking, data analytics, and full-stack web development.',
    technologies: ['Python', 'Linux', 'MongoDB', 'React', 'Data Analytics'],
    achievements: ['Academic project delivery', 'Technical workshop participation', 'Self-driven learning in cloud and infrastructure'],
    startDate: '2022-08-01',
    endDate: '2026-06-30',
  },
];

export const achievements: Achievement[] = [
  {
    title: 'Cloud & Linux Learning Journey',
    description: 'Built a strong foundation in cloud concepts, Linux administration, and secure system basics through practical exploration and project work.',
    organization: 'Self-driven Learning',
    date: '2025-04-10',
    link: 'https://github.com/',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  },
];

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Skills', href: '/skills' },
  { label: 'Projects', href: '/projects' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Experience', href: '/experience' },
  { label: 'Contact', href: '/contact' },
];
