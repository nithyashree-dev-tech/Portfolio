import { useEffect, useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, MessageSquareText, Projector, Trash2, Trophy, Wrench } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Achievement, Certification, ContactMessage, ExperienceItem, Profile, Project, Skill } from '../types';
import { achievementService, authService, certificationService, experienceService, getAuthToken, messageService, profileService, projectService, skillService } from '../services/api';

type TabKey = 'projects' | 'certifications' | 'skills' | 'experience' | 'achievements' | 'messages' | 'profile';

type DraftState = Record<string, string | boolean>;

const emptyProjectDraft = {
  title: '',
  slug: '',
  description: '',
  longDescription: '',
  technologies: '',
  features: '',
  githubUrl: '',
  liveUrl: '',
  image: '',
  featured: false,
};

const emptyCertificationDraft = {
  title: '',
  issuer: '',
  issueDate: '',
  credentialId: '',
  credentialUrl: '',
  certificateImage: '',
  skills: '',
};

const emptySkillDraft = {
  name: '',
  category: '',
  level: 'Hands-on',
  icon: '',
  order: '0',
};

const emptyExperienceDraft = {
  organization: '',
  role: '',
  description: '',
  technologies: '',
  achievements: '',
  startDate: '',
  endDate: '',
};

const emptyAchievementDraft = {
  title: '',
  description: '',
  organization: '',
  date: '',
  link: '',
  image: '',
};

const emptyProfileDraft = {
  name: '', professionalTitle: '', shortBio: '', longBio: '', email: '', location: '',
  githubUrl: '', linkedinUrl: '', resumeUrl: '', cloudResumeFileId: '', softwareResumeFileId: '', profileImage: '',
};

const dashboardTabs: { key: TabKey; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'messages', label: 'Messages' },
  { key: 'profile', label: 'Profile' },
];

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathTab = location.pathname.split('/').pop() as TabKey;
  const [activeTab, setActiveTab] = useState<TabKey>(dashboardTabs.some((tab) => tab.key === pathTab) ? pathTab : 'projects');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState<'cloud' | 'software' | null>(null);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<DraftState>({ ...emptyProjectDraft });

  const stats = [
    { label: 'Projects', value: projects.length, icon: Projector },
    { label: 'Certifications', value: certifications.length, icon: BadgeCheck },
    { label: 'Skills', value: skills.length, icon: Wrench },
    { label: 'Experience', value: experience.length, icon: BriefcaseBusiness },
    { label: 'Achievements', value: achievements.length, icon: Trophy },
    { label: 'Unread Messages', value: messages.filter((message) => !message.status || message.status === 'unread' || message.status === 'new').length, icon: MessageSquareText },
  ];

  const resetDraft = (tab: TabKey) => {
    if (tab === 'projects') setDraft({ ...emptyProjectDraft });
    if (tab === 'certifications') setDraft({ ...emptyCertificationDraft });
    if (tab === 'skills') setDraft({ ...emptySkillDraft });
    if (tab === 'experience') setDraft({ ...emptyExperienceDraft });
    if (tab === 'achievements') setDraft({ ...emptyAchievementDraft });
    if (tab === 'messages') setDraft({});
    if (tab === 'profile') setDraft({ ...(profile || emptyProfileDraft) });
    setWorkingId(null);
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const loadDashboard = async () => {
      try {
        const [projectsResponse, certificationsResponse, skillsResponse, experienceResponse, achievementsResponse, messagesResponse, profileResponse] = await Promise.all([
          projectService.getAll(),
          certificationService.getAll(),
          skillService.getAll(),
          experienceService.getAll(),
          achievementService.getAll(),
          messageService.getAll(),
          profileService.get(),
        ]);

        setProjects(projectsResponse.data);
        setCertifications(certificationsResponse.data);
        setSkills(skillsResponse.data);
        setExperience(experienceResponse.data);
        setAchievements(achievementsResponse.data);
        setMessages(messagesResponse.data);
        setProfile(profileResponse.data);
        setDraft({ ...(profileResponse.data || emptyProfileDraft) });
      } catch (dashboardError) {
        console.error('Dashboard load failed', dashboardError);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (logoutError) {
      console.error('Logout failed', logoutError);
    } finally {
      localStorage.removeItem('portfolio-admin-token');
      navigate('/admin/login');
    }
  };

  const handleDraftChange = (field: string, value: string | boolean) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleResumeUpload = async (role: 'cloud' | 'software', file?: File) => {
    if (!file) return;
    setUploadingResume(role);
    setError('');
    try {
      const response = await profileService.uploadResume(role, file);
      const field = role === 'cloud' ? 'cloudResumeFileId' : 'softwareResumeFileId';
      handleDraftChange(field, response.data.fileId);
      setProfile((current) => current ? { ...current, [field]: response.data.fileId } : current);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload resume.');
    } finally {
      setUploadingResume(null);
    }
  };

  const parseList = (value: string) => value.split(',').map((entry) => entry.trim()).filter(Boolean);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (activeTab === 'projects') {
        const payload: Partial<Project> = {
          title: String(draft.title || ''),
          slug: String(draft.slug || ''),
          description: String(draft.description || ''),
          longDescription: String(draft.longDescription || ''),
          technologies: parseList(String(draft.technologies || '')),
          features: parseList(String(draft.features || '')),
          githubUrl: String(draft.githubUrl || ''),
          liveUrl: String(draft.liveUrl || ''),
          image: String(draft.image || ''),
          featured: Boolean(draft.featured),
        };

        if (workingId) {
          const updated = await projectService.update(workingId, payload);
          setProjects((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
        } else {
          const created = await projectService.create(payload);
          setProjects((current) => [created.data, ...current]);
        }
      }

      if (activeTab === 'certifications') {
        const payload: Partial<Certification> = {
          title: String(draft.title || ''),
          issuer: String(draft.issuer || ''),
          issueDate: String(draft.issueDate || ''),
          credentialId: String(draft.credentialId || ''),
          credentialUrl: String(draft.credentialUrl || ''),
          certificateImage: String(draft.certificateImage || ''),
          skills: parseList(String(draft.skills || '')),
        };

        if (workingId) {
          const updated = await certificationService.update(workingId, payload);
          setCertifications((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
        } else {
          const created = await certificationService.create(payload);
          setCertifications((current) => [created.data, ...current]);
        }
      }

      if (activeTab === 'skills') {
        const payload: Partial<Skill> = {
          name: String(draft.name || ''),
          category: String(draft.category || ''),
          level: (String(draft.level || 'Hands-on')) as Skill['level'],
          icon: String(draft.icon || ''),
          order: Number(draft.order || 0),
        };

        if (workingId) {
          const updated = await skillService.update(workingId, payload);
          setSkills((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
        } else {
          const created = await skillService.create(payload);
          setSkills((current) => [created.data, ...current]);
        }
      }

      if (activeTab === 'experience') {
        const payload: Partial<ExperienceItem> = {
          organization: String(draft.organization || ''),
          role: String(draft.role || ''),
          description: String(draft.description || ''),
          technologies: parseList(String(draft.technologies || '')),
          achievements: parseList(String(draft.achievements || '')),
          startDate: String(draft.startDate || ''),
          endDate: String(draft.endDate || ''),
        };

        if (workingId) {
          const updated = await experienceService.update(workingId, payload);
          setExperience((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
        } else {
          const created = await experienceService.create(payload);
          setExperience((current) => [created.data, ...current]);
        }
      }

      if (activeTab === 'achievements') {
        const payload: Partial<Achievement> = {
          title: String(draft.title || ''),
          description: String(draft.description || ''),
          organization: String(draft.organization || ''),
          date: String(draft.date || ''),
          link: String(draft.link || ''),
          image: String(draft.image || ''),
        };

        if (workingId) {
          const updated = await achievementService.update(workingId, payload);
          setAchievements((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
        } else {
          const created = await achievementService.create(payload);
          setAchievements((current) => [created.data, ...current]);
        }
      }

      if (activeTab === 'profile') {
        const updated = await profileService.update({
          name: String(draft.name || ''),
          professionalTitle: String(draft.professionalTitle || ''),
          shortBio: String(draft.shortBio || ''),
          longBio: String(draft.longBio || ''),
          email: String(draft.email || ''),
          location: String(draft.location || ''),
          githubUrl: String(draft.githubUrl || ''),
          linkedinUrl: String(draft.linkedinUrl || ''),
          profileImage: String(draft.profileImage || ''),
        });
        setProfile(updated.data);
      }

      resetDraft(activeTab);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tab: TabKey, id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this entry? This action cannot be undone.')) return;

    try {
      if (tab === 'projects') await projectService.remove(id);
      if (tab === 'certifications') await certificationService.remove(id);
      if (tab === 'skills') await skillService.remove(id);
      if (tab === 'experience') await experienceService.remove(id);
      if (tab === 'achievements') await achievementService.remove(id);
      if (tab === 'messages') await messageService.remove(id);

      if (tab === 'projects') setProjects((current) => current.filter((item) => item._id !== id));
      if (tab === 'certifications') setCertifications((current) => current.filter((item) => item._id !== id));
      if (tab === 'skills') setSkills((current) => current.filter((item) => item._id !== id));
      if (tab === 'experience') setExperience((current) => current.filter((item) => item._id !== id));
      if (tab === 'achievements') setAchievements((current) => current.filter((item) => item._id !== id));
      if (tab === 'messages') setMessages((current) => current.filter((item) => item._id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete item.');
    }
  };

  const updateMessageStatus = async (id: string | undefined, status: 'read' | 'archived') => {
    if (!id) return;
    try {
      const updated = await messageService.update(id, { status });
      setMessages((current) => current.map((item) => (item._id === id ? updated.data : item)));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update message.');
    }
  };

  const beginEdit = (tab: TabKey, item: Record<string, unknown>) => {
    const entry = Object.fromEntries(Object.entries(item).map(([key, value]) => [key, value ?? '']));
    setDraft({ ...(entry as DraftState) });
    setWorkingId(String(item._id || ''));
    setActiveTab(tab);
  };

  const renderList = () => {
    if (activeTab === 'projects') {
      return projects.map((project) => (
        <div key={project._id ?? project.slug} className="card admin-item">
          <div>
            <h4>{project.title}</h4>
            <p>{project.description}</p>
          </div>
          <div className="admin-actions">
            <button type="button" className="button secondary small" onClick={() => beginEdit('projects', project)}>Edit</button>
            <button type="button" className="button ghost small" onClick={() => void handleDelete('projects', project._id)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      ));
    }

    if (activeTab === 'certifications') {
      return certifications.map((item) => (
        <div key={item._id ?? item.title} className="card admin-item">
          <div>
            <h4>{item.title}</h4>
            <p>{item.issuer}</p>
          </div>
          <div className="admin-actions">
            <button type="button" className="button secondary small" onClick={() => beginEdit('certifications', item)}>Edit</button>
            <button type="button" className="button ghost small" onClick={() => void handleDelete('certifications', item._id)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      ));
    }

    if (activeTab === 'skills') {
      return skills.map((item) => (
        <div key={item._id ?? item.name} className="card admin-item">
          <div>
            <h4>{item.name}</h4>
            <p>{item.category} • {item.level}</p>
          </div>
          <div className="admin-actions">
            <button type="button" className="button secondary small" onClick={() => beginEdit('skills', item)}>Edit</button>
            <button type="button" className="button ghost small" onClick={() => void handleDelete('skills', item._id)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      ));
    }

    if (activeTab === 'experience') {
      return experience.map((item) => (
        <div key={item._id ?? `${item.organization}-${item.role}`} className="card admin-item">
          <div>
            <h4>{item.role}</h4>
            <p>{item.organization}</p>
          </div>
          <div className="admin-actions">
            <button type="button" className="button secondary small" onClick={() => beginEdit('experience', item)}>Edit</button>
            <button type="button" className="button ghost small" onClick={() => void handleDelete('experience', item._id)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      ));
    }

    if (activeTab === 'achievements') {
      return achievements.map((item) => (
        <div key={item._id ?? item.title} className="card admin-item">
          <div>
            <h4>{item.title}</h4>
            <p>{item.organization}</p>
          </div>
          <div className="admin-actions">
            <button type="button" className="button secondary small" onClick={() => beginEdit('achievements', item)}>Edit</button>
            <button type="button" className="button ghost small" onClick={() => void handleDelete('achievements', item._id)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      ));
    }

    return messages.map((item) => (
      <div key={item._id ?? `${item.name}-${item.email}`} className="card admin-item">
        <div>
          <h4>{item.subject}</h4>
          <p>{item.name} • {item.email}</p>
          <small>{item.message}</small>
          <p className="muted">Status: {item.status || 'unread'}</p>
        </div>
        <div className="admin-actions">
          {item.status !== 'read' ? <button type="button" className="button secondary small" onClick={() => void updateMessageStatus(item._id, 'read')}>Mark read</button> : null}
          {item.status !== 'archived' ? <button type="button" className="button secondary small" onClick={() => void updateMessageStatus(item._id, 'archived')}>Archive</button> : null}
          <button type="button" className="button ghost small" onClick={() => void handleDelete('messages', item._id)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    ));
  };

  const renderFormFields = () => {
    if (activeTab === 'projects') {
      return (
        <>
          <label>Title<input value={String(draft.title || '')} onChange={(event) => handleDraftChange('title', event.target.value)} /></label>
          <label>Slug<input value={String(draft.slug || '')} onChange={(event) => handleDraftChange('slug', event.target.value)} /></label>
          <label>Description<textarea value={String(draft.description || '')} onChange={(event) => handleDraftChange('description', event.target.value)} /></label>
          <label>Long Description<textarea value={String(draft.longDescription || '')} onChange={(event) => handleDraftChange('longDescription', event.target.value)} /></label>
          <label>Technologies<input value={String(draft.technologies || '')} onChange={(event) => handleDraftChange('technologies', event.target.value)} /></label>
          <label>Features<input value={String(draft.features || '')} onChange={(event) => handleDraftChange('features', event.target.value)} /></label>
          <label>GitHub URL<input value={String(draft.githubUrl || '')} onChange={(event) => handleDraftChange('githubUrl', event.target.value)} /></label>
          <label>Live URL<input value={String(draft.liveUrl || '')} onChange={(event) => handleDraftChange('liveUrl', event.target.value)} /></label>
          <label>Image URL<input value={String(draft.image || '')} onChange={(event) => handleDraftChange('image', event.target.value)} /></label>
          <label className="check-row"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => handleDraftChange('featured', event.target.checked)} /> Featured project</label>
        </>
      );
    }

    if (activeTab === 'certifications') {
      return (
        <>
          <label>Title<input value={String(draft.title || '')} onChange={(event) => handleDraftChange('title', event.target.value)} /></label>
          <label>Issuer<input value={String(draft.issuer || '')} onChange={(event) => handleDraftChange('issuer', event.target.value)} /></label>
          <label>Issue Date<input value={String(draft.issueDate || '')} onChange={(event) => handleDraftChange('issueDate', event.target.value)} /></label>
          <label>Credential ID<input value={String(draft.credentialId || '')} onChange={(event) => handleDraftChange('credentialId', event.target.value)} /></label>
          <label>Credential URL<input value={String(draft.credentialUrl || '')} onChange={(event) => handleDraftChange('credentialUrl', event.target.value)} /></label>
          <label>Certificate Image<input value={String(draft.certificateImage || '')} onChange={(event) => handleDraftChange('certificateImage', event.target.value)} /></label>
          <label>Skills<input value={String(draft.skills || '')} onChange={(event) => handleDraftChange('skills', event.target.value)} /></label>
        </>
      );
    }

    if (activeTab === 'skills') {
      return (
        <>
          <label>Name<input value={String(draft.name || '')} onChange={(event) => handleDraftChange('name', event.target.value)} /></label>
          <label>Category<input value={String(draft.category || '')} onChange={(event) => handleDraftChange('category', event.target.value)} /></label>
          <label>Level
            <select value={String(draft.level || 'Hands-on')} onChange={(event) => handleDraftChange('level', event.target.value)}>
              <option>Hands-on</option>
              <option>Working Knowledge</option>
              <option>Familiar</option>
              <option>Currently Learning</option>
            </select>
          </label>
          <label>Icon<input value={String(draft.icon || '')} onChange={(event) => handleDraftChange('icon', event.target.value)} /></label>
          <label>Order<input type="number" value={String(draft.order || '0')} onChange={(event) => handleDraftChange('order', event.target.value)} /></label>
        </>
      );
    }

    if (activeTab === 'experience') {
      return (
        <>
          <label>Organization<input value={String(draft.organization || '')} onChange={(event) => handleDraftChange('organization', event.target.value)} /></label>
          <label>Role<input value={String(draft.role || '')} onChange={(event) => handleDraftChange('role', event.target.value)} /></label>
          <label>Description<textarea value={String(draft.description || '')} onChange={(event) => handleDraftChange('description', event.target.value)} /></label>
          <label>Technologies<input value={String(draft.technologies || '')} onChange={(event) => handleDraftChange('technologies', event.target.value)} /></label>
          <label>Achievements<input value={String(draft.achievements || '')} onChange={(event) => handleDraftChange('achievements', event.target.value)} /></label>
          <label>Start Date<input value={String(draft.startDate || '')} onChange={(event) => handleDraftChange('startDate', event.target.value)} /></label>
          <label>End Date<input value={String(draft.endDate || '')} onChange={(event) => handleDraftChange('endDate', event.target.value)} /></label>
        </>
      );
    }

    if (activeTab === 'achievements') {
      return (
        <>
          <label>Title<input value={String(draft.title || '')} onChange={(event) => handleDraftChange('title', event.target.value)} /></label>
          <label>Description<textarea value={String(draft.description || '')} onChange={(event) => handleDraftChange('description', event.target.value)} /></label>
          <label>Organization<input value={String(draft.organization || '')} onChange={(event) => handleDraftChange('organization', event.target.value)} /></label>
          <label>Date<input value={String(draft.date || '')} onChange={(event) => handleDraftChange('date', event.target.value)} /></label>
          <label>Link<input value={String(draft.link || '')} onChange={(event) => handleDraftChange('link', event.target.value)} /></label>
          <label>Image<input value={String(draft.image || '')} onChange={(event) => handleDraftChange('image', event.target.value)} /></label>
        </>
      );
    }

    if (activeTab === 'profile') {
      return (
        <>
          <label>Name<input required value={String(draft.name || '')} onChange={(event) => handleDraftChange('name', event.target.value)} /></label>
          <label>Professional Title<input value={String(draft.professionalTitle || '')} onChange={(event) => handleDraftChange('professionalTitle', event.target.value)} /></label>
          <label>Short Bio<textarea value={String(draft.shortBio || '')} onChange={(event) => handleDraftChange('shortBio', event.target.value)} /></label>
          <label>Long Bio<textarea value={String(draft.longBio || '')} onChange={(event) => handleDraftChange('longBio', event.target.value)} /></label>
          <label>Email<input type="email" value={String(draft.email || '')} onChange={(event) => handleDraftChange('email', event.target.value)} /></label>
          <label>Location<input value={String(draft.location || '')} onChange={(event) => handleDraftChange('location', event.target.value)} /></label>
          <label>GitHub URL<input type="url" value={String(draft.githubUrl || '')} onChange={(event) => handleDraftChange('githubUrl', event.target.value)} /></label>
          <label>LinkedIn URL<input type="url" value={String(draft.linkedinUrl || '')} onChange={(event) => handleDraftChange('linkedinUrl', event.target.value)} /></label>
          <label>
            Cloud Engineering Resume (PDF)
            <input type="file" accept="application/pdf,.pdf" onChange={(event) => void handleResumeUpload('cloud', event.target.files?.[0])} />
            <small>{uploadingResume === 'cloud' ? 'Uploading...' : draft.cloudResumeFileId ? 'Cloud resume stored in MongoDB.' : 'No cloud resume uploaded.'}</small>
          </label>
          <label>
            Software Engineering Resume (PDF)
            <input type="file" accept="application/pdf,.pdf" onChange={(event) => void handleResumeUpload('software', event.target.files?.[0])} />
            <small>{uploadingResume === 'software' ? 'Uploading...' : draft.softwareResumeFileId ? 'Software resume stored in MongoDB.' : 'No software resume uploaded.'}</small>
          </label>
          <label>Profile Image URL<input type="url" value={String(draft.profileImage || '')} onChange={(event) => handleDraftChange('profileImage', event.target.value)} /></label>
        </>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="page container admin-dashboard">
        <p className="muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page container admin-dashboard">
      <div className="section-head-row">
        <h1>Admin Dashboard</h1>
        <button type="button" className="button secondary small" onClick={handleLogout}>Logout</button>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card stat-card">
            <Icon size={20} />
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card admin-panel">
        <div className="tab-row">
          {dashboardTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.key);
                resetDraft(tab.key);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-content-grid">
          <section className="card admin-list-panel">
            <div className="admin-list-header">
              <h3>{dashboardTabs.find((tab) => tab.key === activeTab)?.label}</h3>
              <button type="button" className="button primary small" onClick={() => resetDraft(activeTab)}>New</button>
            </div>
            {renderList()}
          </section>

          {activeTab !== 'messages' ? (
            <form className="card admin-form-panel" onSubmit={handleSubmit}>
              <h3>{workingId ? 'Edit entry' : 'Add entry'}</h3>
              {renderFormFields()}
              {error ? <p className="form-feedback error">{error}</p> : null}
              <div className="admin-form-actions">
                <button type="submit" className="button primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="button secondary" onClick={() => resetDraft(activeTab)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="card admin-form-panel">
              <h3>Messages</h3>
              <p className="muted">Messages are read-only from the dashboard. You can delete them when no longer needed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
