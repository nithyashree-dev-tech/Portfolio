const projectSeed = [
  {
    title: 'AI Interview Preparation Assistant',
    slug: 'ai-interview-preparation-assistant',
    description:
      'An AI-powered interview preparation platform that generates questions and evaluates candidate responses with structured feedback.',
    longDescription:
      'A production-focused interview preparation tool that helps users practice technical and behavioral assessment questions while receiving structured AI guidance.',
    technologies: ['React', 'Vite', 'Node.js', 'Express.js', 'MongoDB', 'OpenRouter API', 'JWT', 'Postman', 'Render'],
    features: [
      'AI-generated interview questions',
      'Response evaluation with structured feedback',
      'Secure authentication and user sessions',
      'Candidate performance history',
    ],
    githubUrl: 'https://github.com/example/ai-interview-prep',
    liveUrl: 'https://example.com/demo',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
  },
];

const certificationSeed = [
  {
    title: 'Google Cloud Skills Boost - Cloud Fundamentals',
    issuer: 'Google Cloud',
    issueDate: '2025-02-15',
    credentialId: 'GCP-SKILL-001',
    credentialUrl: 'https://example.com/certificate',
    certificateImage: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80',
    skills: ['Google Cloud', 'IAM', 'Cloud Architecture'],
  },
];

const skillSeed = [
  { name: 'Google Cloud', category: 'Cloud Computing', level: 'Hands-on', icon: 'cloud', order: 1 },
  { name: 'IAM', category: 'Cloud Computing', level: 'Hands-on', icon: 'shield', order: 2 },
  { name: 'Linux', category: 'Linux & System Administration', level: 'Hands-on', icon: 'terminal', order: 3 },
  { name: 'Bash', category: 'Linux & System Administration', level: 'Hands-on', icon: 'terminal', order: 4 },
  { name: 'TCP/IP', category: 'Networking', level: 'Working Knowledge', icon: 'network', order: 5 },
  { name: 'Python', category: 'Programming & Development', level: 'Hands-on', icon: 'code', order: 6 },
  { name: 'JavaScript', category: 'Programming & Development', level: 'Hands-on', icon: 'code', order: 7 },
  { name: 'MongoDB', category: 'Databases', level: 'Working Knowledge', icon: 'database', order: 8 },
  { name: 'Git', category: 'Tools', level: 'Hands-on', icon: 'git', order: 9 },
  { name: 'Docker', category: 'Tools', level: 'Currently Learning', icon: 'container', order: 10 },
];

const experienceSeed = [
  {
    organization: 'Jayalakshmi Institute of Technology',
    role: 'AI & Data Science Student',
    description:
      'Worked on academic and technical projects related to cloud, Linux, data analytics, and AI-driven applications.',
    startDate: '2022-08-01',
    endDate: '2026-06-30',
    technologies: ['Python', 'MongoDB', 'Linux', 'Data Analytics'],
    achievements: ['Academic project development', 'Technical event participation', 'Hands-on experimentation with cloud technologies'],
  },
];

const achievementSeed = [
  {
    title: 'Cloud & Linux Learning Journey',
    description: 'Built practical understanding of cloud services, Linux administration, and system operations through self-driven study and projects.',
    organization: 'Self-driven Learning',
    date: '2025-04-10',
    link: 'https://github.com/example',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
];

const messageSeed = [];
const profileSeed = {
  name: 'M Nithya Shree',
  professionalTitle: 'AI & Data Science Engineer',
  shortBio: 'AI and Data Science engineering student focused on cloud, Linux, networking, cybersecurity, and data analytics.',
  longBio: 'Building reliable, scalable, and secure technology solutions while developing practical expertise in cloud computing, Linux administration, networking, and data analytics.',
  email: 'nithyashree@example.com',
  location: 'Tamil Nadu, India',
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  resumeUrl: '',
  cloudResumeUrl: '',
  softwareResumeUrl: '',
  profileImage: '',
};

module.exports = {
  projectSeed,
  certificationSeed,
  skillSeed,
  experienceSeed,
  achievementSeed,
  messageSeed,
  profileSeed,
};
