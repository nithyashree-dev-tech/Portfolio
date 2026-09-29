import type { PageContentField, Profile } from '../types';

export const PAGE_CONTENT_PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'photos', label: 'Photos' },
  { key: 'experience', label: 'Experience' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'resume', label: 'Resume' },
  { key: 'contact', label: 'Contact' },
] as const;

export const DEFAULT_PAGE_FIELDS: Record<string, PageContentField[]> = {
  home: [
    { id: 'focus', label: 'Focus', value: 'Cloud & Linux' },
    { id: 'skills', label: 'Skills', value: 'Networking & Data' },
    { id: 'approach', label: 'Approach', value: 'Secure & Scalable' },
  ],
  about: [
    { id: 'title', label: 'Page title', value: 'Building reliable systems and data-driven digital experiences' },
    { id: 'description', label: 'Page introduction', value: 'I am a B.Tech AI & Data Science engineering student with a strong interest in cloud computing, Linux system administration, networking, cybersecurity, and scalable technology solutions.' },
    { id: 'introTitle', label: 'Introduction heading', value: 'Professional Introduction' },
    { id: 'introText', label: 'Introduction', value: 'I enjoy solving real-world technical problems through automation, infrastructure understanding, and data-informed decision-making. My focus is on building secure, reliable systems that scale smoothly while maintaining clear performance and operational visibility.' },
    { id: 'educationTitle', label: 'Education heading', value: 'Education' },
    { id: 'educationProgram', label: 'Degree or program', value: 'B.Tech AI & Data Science' },
    { id: 'educationInstitution', label: 'Institution', value: 'Jayalakshmi Institute of Technology' },
    { id: 'educationScore', label: 'Score or result', value: 'CGPA: 8.8' },
    { id: 'careerTitle', label: 'Career interests heading', value: 'Career Interests' },
    { id: 'careerText', label: 'Career interests', value: 'Cloud engineering, Linux administration, network operations, cybersecurity, data analytics, and full-stack system problem solving.' },
    { id: 'technicalTitle', label: 'Technical interests heading', value: 'Technical Interests' },
    { id: 'technicalText', label: 'Technical interests', value: 'Cloud infrastructure, secure deployment practices, system automation, networking fundamentals, and data-driven insights.' },
    { id: 'strengthsTitle', label: 'Strengths heading', value: 'Strengths' },
    { id: 'strengthsText', label: 'Strengths', value: 'Curious mindset, analytical thinking, structured learning, problem solving, and a strong desire to build practical technology solutions.' },
  ],
};

export const getPageFields = (profile: Profile | null, page: string): PageContentField[] =>
  profile?.pageContent?.[page] ?? DEFAULT_PAGE_FIELDS[page] ?? [];

export const getPageFieldValue = (profile: Profile | null, page: string, id: string, fallback: string) =>
  getPageFields(profile, page).find((field) => field.id === id)?.value ?? fallback;

export const RESERVED_PAGE_FIELD_IDS = new Set([
  ...DEFAULT_PAGE_FIELDS.home.map((field) => field.id),
  ...DEFAULT_PAGE_FIELDS.about.map((field) => field.id),
]);