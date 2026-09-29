import type { ApiResponse, Achievement, Certification, ContactMessage, ExperienceItem, Profile, Project, Skill } from '../types';

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const API_BASE_URL = configuredApiBase && /^https?:\/\//i.test(configuredApiBase)
  ? configuredApiBase
  : configuredApiBase
    ? `${window.location.origin}${configuredApiBase.startsWith('/') ? '' : '/'}${configuredApiBase}`
    : '';
const TOKEN_KEY = 'portfolio-admin-token';

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required. Set it in the root .env file.');
}

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(`Unable to reach the backend at ${API_BASE_URL}. Check that the API service is running.`, 0);
  }

  let data: ApiResponse<unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('The backend returned an invalid response.', response.status);
  }

  if (!response.ok) {
    throw new ApiError(data?.message || 'Request failed', response.status);
  }

  return data as T;
}

export const authService = {
  login: (email: string, password: string) => request<ApiResponse<{ token: string }>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  me: () => request<ApiResponse<{ user: { email: string } }>>('/auth/me'),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    return request<ApiResponse<{}>>('/auth/logout', { method: 'POST' });
  },
};

export const projectService = {
  getAll: () => request<ApiResponse<Project[]>>('/projects'),
  getBySlug: (slug: string) => request<ApiResponse<Project>>(`/projects/${slug}`),
  create: (payload: Partial<Project>) => request<ApiResponse<Project>>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: Partial<Project>) => request<ApiResponse<Project>>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id: string) => request<ApiResponse<{}>>(`/projects/${id}`, { method: 'DELETE' }),
};

export const certificationService = {
  getAll: () => request<ApiResponse<Certification[]>>('/certifications'),
  create: (payload: Partial<Certification>) => request<ApiResponse<Certification>>('/certifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: Partial<Certification>) => request<ApiResponse<Certification>>(`/certifications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id: string) => request<ApiResponse<{}>>(`/certifications/${id}`, { method: 'DELETE' }),
};

export const skillService = {
  getAll: () => request<ApiResponse<Skill[]>>('/skills'),
  create: (payload: Partial<Skill>) => request<ApiResponse<Skill>>('/skills', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: Partial<Skill>) => request<ApiResponse<Skill>>(`/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id: string) => request<ApiResponse<{}>>(`/skills/${id}`, { method: 'DELETE' }),
};

export const experienceService = {
  getAll: () => request<ApiResponse<ExperienceItem[]>>('/experience'),
  create: (payload: Partial<ExperienceItem>) => request<ApiResponse<ExperienceItem>>('/experience', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: Partial<ExperienceItem>) => request<ApiResponse<ExperienceItem>>(`/experience/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id: string) => request<ApiResponse<{}>>(`/experience/${id}`, { method: 'DELETE' }),
};

export const achievementService = {
  getAll: () => request<ApiResponse<Achievement[]>>('/achievements'),
  create: (payload: Partial<Achievement>) => request<ApiResponse<Achievement>>('/achievements', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: Partial<Achievement>) => request<ApiResponse<Achievement>>(`/achievements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id: string) => request<ApiResponse<{}>>(`/achievements/${id}`, { method: 'DELETE' }),
};

export const messageService = {
  getAll: () => request<ApiResponse<ContactMessage[]>>('/messages'),
  create: (payload: ContactMessage) => request<ApiResponse<ContactMessage>>('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  notify: (id: string) => request<ApiResponse<ContactMessage>>(`/messages/${id}/notify`, { method: 'POST' }),
  update: (id: string, payload: Partial<ContactMessage>) => request<ApiResponse<ContactMessage>>(`/messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id: string) => request<ApiResponse<{}>>(`/messages/${id}`, { method: 'DELETE' }),
};

export const profileService = {
  get: () => request<ApiResponse<Profile>>('/profile'),
  update: (payload: Partial<Profile>) => request<ApiResponse<Profile>>('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  uploadResume: (role: 'cloud' | 'software', file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return request<ApiResponse<{ url: string; fileId: string }>>(`/profile/resumes/${role}`, {
      method: 'POST',
      body: formData,
    });
  },
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthToken = () => getStoredToken();

export { API_BASE_URL };
