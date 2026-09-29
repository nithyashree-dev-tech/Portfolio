export type Skill = {
  _id?: string;
  name: string;
  category: string;
  level: 'Hands-on' | 'Working Knowledge' | 'Familiar' | 'Currently Learning';
  icon?: string;
  order?: number;
};

export type Project = {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  githubUrl: string;
  liveUrl: string;
  image: string;
  featured?: boolean;
  problem?: string;
  solution?: string;
  architecture?: string;
  auth?: string;
  database?: string;
  aiIntegration?: string;
  challenges?: string[];
  futureImprovements?: string[];
};

export type Certification = {
  _id?: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl: string;
  certificateImage: string;
  skills: string[];
};

export type ExperienceItem = {
  _id?: string;
  organization: string;
  role: string;
  description: string;
  technologies: string[];
  achievements: string[];
  startDate: string;
  endDate?: string;
};

export type Achievement = {
  _id?: string;
  title: string;
  description: string;
  organization: string;
  date: string;
  link?: string;
  image?: string;
};

export type ContactMessage = {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: 'unread' | 'read' | 'archived';
  emailDeliveryStatus?: 'not_configured' | 'pending' | 'sent' | 'failed';
  emailDeliveryError?: string;
  emailAttemptedAt?: string | null;
  emailSentAt?: string | null;
  createdAt?: string;
};

export type GalleryPhoto = {
  _id: string;
  title: string;
  caption: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  createdAt: string;
  imageUrl: string;
};

export type Profile = {
  _id?: string;
  name: string;
  professionalTitle: string;
  shortBio: string;
  longBio: string;
  email: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  cloudResumeUrl?: string;
  softwareResumeUrl?: string;
  cloudResumeFileId?: string;
  softwareResumeFileId?: string;
  profileImage: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
