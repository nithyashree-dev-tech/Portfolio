import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, Image, MessageSquareText, Plus, Projector, Trash2, Trophy, Wrench } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Achievement, Certification, ContactMessage, ExperienceItem, GalleryPhoto, PageContentField, Profile, Project, Skill } from '../types';
import { achievementService, API_BASE_URL, authService, certificationService, experienceService, galleryService, getAuthToken, mediaService, messageService, profileService, projectService, skillService } from '../services/api';
import { DEFAULT_PAGE_FIELDS, getPageFields, PAGE_CONTENT_PAGES } from '../data/pageContent';

type TabKey = 'home' | 'about' | 'page-content' | 'projects' | 'certifications' | 'skills' | 'experience' | 'achievements' | 'gallery' | 'messages' | 'profile';

type DraftState = Record<string, string | boolean>;

const emptyProjectDraft = {
  title: '',
  slug: '',
  description: '',
  longDescription: '',
  technologies: '',
  features: '',
  problem: '',
  solution: '',
  architecture: '',
  auth: '',
  database: '',
  aiIntegration: '',
  challenges: '',
  futureImprovements: '',
  githubUrl: '',
  liveUrl: '',
  image: '',
  featured: false,
  startDate: '',
  endDate: '',
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

const emptyGalleryDraft = { title: '', caption: '' };

const emptyProfileDraft = {
  name: '', professionalTitle: '', shortBio: '', longBio: '', email: '', location: '',
  githubUrl: '', linkedinUrl: '', resumeUrl: '', cloudResumeFileId: '', softwareResumeFileId: '', profileImage: '',
};

const toScalarDraft = (value: Profile | null) => Object.fromEntries(
  Object.entries(value || emptyProfileDraft).filter(([, fieldValue]) =>
    typeof fieldValue === 'string' || typeof fieldValue === 'boolean',
  ),
) as DraftState;

const dashboardTabs: { key: TabKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'page-content', label: 'Page Content' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'gallery', label: 'Photo Gallery' },
  { key: 'messages', label: 'Messages' },
  { key: 'profile', label: 'Profile' },
];

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isPageContentRoute = pathSegments.at(-2) === 'page-content';
  const requestedPage = pathSegments.at(-1) || 'home';
  const pathTab = (isPageContentRoute ? 'page-content' : requestedPage) as TabKey;
  const activeTab: TabKey = dashboardTabs.some((tab) => tab.key === pathTab) ? pathTab : 'projects';
  const initialContentPage = useRef(
    PAGE_CONTENT_PAGES.find((page) => page.key === requestedPage)?.key || 'home',
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState<'cloud' | 'software' | null>(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingImageField, setUploadingImageField] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const stagedContentImages = useRef<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<DraftState>({ ...emptyProjectDraft });
  const [selectedContentPage, setSelectedContentPage] = useState<string>(
    PAGE_CONTENT_PAGES.some((page) => page.key === pathTab) ? pathTab : 'home',
  );
  const [pageFields, setPageFields] = useState<PageContentField[]>(DEFAULT_PAGE_FIELDS.home);

  const stats = [
    { label: 'Projects', value: projects.length, icon: Projector },
    { label: 'Certifications', value: certifications.length, icon: BadgeCheck },
    { label: 'Skills', value: skills.length, icon: Wrench },
    { label: 'Experience', value: experience.length, icon: BriefcaseBusiness },
    { label: 'Achievements', value: achievements.length, icon: Trophy },
    { label: 'Photos', value: photos.length, icon: Image },
    { label: 'Unread Messages', value: messages.filter((message) => !message.status || message.status === 'unread').length, icon: MessageSquareText },
  ];

  const resetDraft = (tab: TabKey) => {
    for (const imageUrl of stagedContentImages.current) void mediaService.removeImageByUrl(imageUrl).catch(() => {});
    stagedContentImages.current = [];
    if (tab === 'projects') setDraft({ ...emptyProjectDraft });
    if (tab === 'certifications') setDraft({ ...emptyCertificationDraft });
    if (tab === 'skills') setDraft({ ...emptySkillDraft });
    if (tab === 'experience') setDraft({ ...emptyExperienceDraft });
    if (tab === 'achievements') setDraft({ ...emptyAchievementDraft });
    if (tab === 'gallery') {
      setDraft({ ...emptyGalleryDraft });
      setPhotoFile(null);
    }
    if (tab === 'messages') setDraft({});
    if (tab === 'profile') setDraft(toScalarDraft(profile));
    if (tab === 'home' || tab === 'about') {
      setSelectedContentPage(tab);
      setPageFields(getPageFields(profile, tab));
      setDraft(toScalarDraft(profile));
    }
    if (tab === 'page-content') setPageFields(getPageFields(profile, selectedContentPage));
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
        const [projectsResponse, certificationsResponse, skillsResponse, experienceResponse, achievementsResponse, messagesResponse, profileResponse, photosResponse] = await Promise.all([
          projectService.getAll(),
          certificationService.getAll(),
          skillService.getAll(),
          experienceService.getAll(),
          achievementService.getAll(),
          messageService.getAll(),
          profileService.get(),
          galleryService.getAll(),
        ]);

        setProjects(projectsResponse.data);
        setCertifications(certificationsResponse.data);
        setSkills(skillsResponse.data);
        setExperience(experienceResponse.data);
        setAchievements(achievementsResponse.data);
        setMessages(messagesResponse.data);
        setPhotos(photosResponse.data);
        setProfile(profileResponse.data);
        setDraft(toScalarDraft(profileResponse.data));
        const initialPage = initialContentPage.current;
        setSelectedContentPage(initialPage);
        setPageFields(getPageFields(profileResponse.data, initialPage));
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

  const handlePageFieldChange = (index: number, field: 'label' | 'value', value: string) => {
    setPageFields((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    ));
  };

  const renderPageFieldsEditor = () => (
    <>
      {pageFields.map((field, index) => (
        <div key={field.id} className="page-field-editor">
          <div className="page-field-editor-header">
            <strong>{field.label || 'New field'}</strong>
              <button
                type="button"
                className="button ghost small"
                aria-label={`Remove ${field.label || 'field'}`}
                title="Remove field"
                onClick={() => setPageFields((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 size={14} />
              </button>
          </div>
          <label>Field name<input required value={field.label} onChange={(event) => handlePageFieldChange(index, 'label', event.target.value)} /></label>
          <label>Content<textarea required value={field.value} onChange={(event) => handlePageFieldChange(index, 'value', event.target.value)} /></label>
        </div>
      ))}
      <button
        type="button"
        className="button secondary small"
        onClick={() => setPageFields((current) => [...current, { id: `custom-${Date.now()}`, label: '', value: '' }])}
      >
        <Plus size={15} /> Add field
      </button>
    </>
  );

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

  const handleProfilePhotoUpload = async (file?: File) => {
    if (!file) return;
    setUploadingProfilePhoto(true);
    setError('');
    try {
      const response = await profileService.uploadPhoto(file);
      handleDraftChange('profileImage', response.data.imageUrl);
      handleDraftChange('profileImageFileId', response.data.fileId);
      setProfile((current) => current ? {
        ...current,
        profileImage: response.data.imageUrl,
        profileImageFileId: response.data.fileId,
      } : current);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload profile photo.');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleContentImageUpload = async (field: 'image' | 'certificateImage', file?: File) => {
    if (!file) return;
    setUploadingImageField(field);
    setError('');
    try {
      const response = await mediaService.uploadImage(file);
      handleDraftChange(field, response.data.imageUrl);
      stagedContentImages.current.push(response.data.imageUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload image.');
    } finally {
      setUploadingImageField(null);
    }
  };

  const finishContentImageSave = async (savedImageUrl: string) => {
    const unusedImages = stagedContentImages.current.filter((imageUrl) => imageUrl !== savedImageUrl);
    await Promise.all(unusedImages.map((imageUrl) => mediaService.removeImageByUrl(imageUrl).catch(() => null)));
    stagedContentImages.current = [];
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
          problem: String(draft.problem || ''),
          solution: String(draft.solution || ''),
          architecture: String(draft.architecture || ''),
          auth: String(draft.auth || ''),
          database: String(draft.database || ''),
          aiIntegration: String(draft.aiIntegration || ''),
          challenges: parseList(String(draft.challenges || '')),
          futureImprovements: parseList(String(draft.futureImprovements || '')),
          githubUrl: String(draft.githubUrl || ''),
          liveUrl: String(draft.liveUrl || ''),
          image: String(draft.image || ''),
          featured: Boolean(draft.featured),
          startDate: String(draft.startDate || ''),
          endDate: String(draft.endDate || ''),
        };

        if (workingId) {
          const previousImage = projects.find((item) => item._id === workingId)?.image || '';
          const updated = await projectService.update(workingId, payload);
          setProjects((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
          if (previousImage && previousImage !== payload.image) await mediaService.removeImageByUrl(previousImage);
        } else {
          const created = await projectService.create(payload);
          setProjects((current) => [created.data, ...current]);
        }
        await finishContentImageSave(String(payload.image || ''));
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
          const previousImage = certifications.find((item) => item._id === workingId)?.certificateImage || '';
          const updated = await certificationService.update(workingId, payload);
          setCertifications((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
          if (previousImage && previousImage !== payload.certificateImage) await mediaService.removeImageByUrl(previousImage);
        } else {
          const created = await certificationService.create(payload);
          setCertifications((current) => [created.data, ...current]);
        }
        await finishContentImageSave(String(payload.certificateImage || ''));
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
          const previousImage = achievements.find((item) => item._id === workingId)?.image || '';
          const updated = await achievementService.update(workingId, payload);
          setAchievements((current) => current.map((item) => (item._id === workingId ? updated.data : item)));
          if (previousImage && previousImage !== payload.image) await mediaService.removeImageByUrl(previousImage);
        } else {
          const created = await achievementService.create(payload);
          setAchievements((current) => [created.data, ...current]);
        }
        await finishContentImageSave(String(payload.image || ''));
      }

      if (activeTab === 'gallery') {
        if (!photoFile) throw new Error('Choose an image before adding it to the gallery.');
        const uploaded = await galleryService.upload(
          photoFile,
          String(draft.title || ''),
          String(draft.caption || ''),
        );
        setPhotos((current) => [uploaded.data, ...current]);
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

      if (activeTab === 'home') {
        const updated = await profileService.update({
          name: String(draft.name || ''),
          professionalTitle: String(draft.professionalTitle || ''),
          shortBio: String(draft.shortBio || ''),
          email: String(draft.email || ''),
          githubUrl: String(draft.githubUrl || ''),
          linkedinUrl: String(draft.linkedinUrl || ''),
          profileImage: String(draft.profileImage || ''),
          pageContent: { ...(profile?.pageContent || {}), home: pageFields },
        });
        setProfile(updated.data);
      }

      if (activeTab === 'about' || activeTab === 'page-content') {
        const page = activeTab === 'about' ? 'about' : selectedContentPage;
        const updated = await profileService.update({
          pageContent: { ...(profile?.pageContent || {}), [page]: pageFields },
        });
        setProfile(updated.data);
      }

      if (activeTab === 'home' || activeTab === 'about' || activeTab === 'page-content') {
        setWorkingId(null);
      } else {
        resetDraft(activeTab);
      }
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
      const imageToDelete = tab === 'projects'
        ? projects.find((item) => item._id === id)?.image
        : tab === 'certifications'
          ? certifications.find((item) => item._id === id)?.certificateImage
          : tab === 'achievements'
            ? achievements.find((item) => item._id === id)?.image
            : undefined;
      if (tab === 'projects') await projectService.remove(id);
      if (tab === 'certifications') await certificationService.remove(id);
      if (tab === 'skills') await skillService.remove(id);
      if (tab === 'experience') await experienceService.remove(id);
      if (tab === 'achievements') await achievementService.remove(id);
      if (tab === 'messages') await messageService.remove(id);
      if (tab === 'gallery') await galleryService.remove(id);
      if (imageToDelete) await mediaService.removeImageByUrl(imageToDelete);

      if (tab === 'projects') setProjects((current) => current.filter((item) => item._id !== id));
      if (tab === 'certifications') setCertifications((current) => current.filter((item) => item._id !== id));
      if (tab === 'skills') setSkills((current) => current.filter((item) => item._id !== id));
      if (tab === 'experience') setExperience((current) => current.filter((item) => item._id !== id));
      if (tab === 'achievements') setAchievements((current) => current.filter((item) => item._id !== id));
      if (tab === 'messages') setMessages((current) => current.filter((item) => item._id !== id));
      if (tab === 'gallery') setPhotos((current) => current.filter((item) => item._id !== id));
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

  const retryMessageNotification = async (id: string | undefined) => {
    if (!id) return;
    try {
      const response = await messageService.notify(id);
      setMessages((current) => current.map((item) => (item._id === id ? response.data : item)));
      setError('');
    } catch (notifyError) {
      setError(notifyError instanceof Error ? notifyError.message : 'Unable to send the email notification.');
    }
  };

  const beginEdit = (tab: TabKey, item: Record<string, unknown>) => {
    const entry = Object.fromEntries(Object.entries(item).map(([key, value]) => [key, value ?? '']));
    setDraft({ ...(entry as DraftState) });
    setWorkingId(String(item._id || ''));
    navigate(`/admin/${tab}`);
  };

  const renderList = () => {
    if (activeTab === 'home' || activeTab === 'about' || activeTab === 'page-content') {
      return <p className="muted">Edit the fields in the panel to update this page.</p>;
    }

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

    if (activeTab === 'gallery') {
      return photos.map((photo) => (
        <div key={photo._id} className="card admin-item admin-gallery-item">
          <img className="admin-gallery-image" src={`${API_BASE_URL}${photo.imageUrl.replace(/^\/api\/v1/, '')}`} alt={photo.title} />
          <div>
            <h4>{photo.title}</h4>
            {photo.caption ? <p>{photo.caption}</p> : null}
          </div>
          <div className="admin-actions">
            <button type="button" className="button ghost small" onClick={() => void handleDelete('gallery', photo._id)}>
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
          <p className="muted">Email: {item.emailDeliveryStatus || 'not_configured'}{item.emailDeliveryError ? ` (${item.emailDeliveryError})` : ''}</p>
        </div>
        <div className="admin-actions">
          {item.emailDeliveryStatus !== 'sent' ? <button type="button" className="button secondary small" onClick={() => void retryMessageNotification(item._id)}>Retry email</button> : null}
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
    if (activeTab === 'home') {
      return (
        <>
          <label>Name<input required value={String(draft.name || '')} onChange={(event) => handleDraftChange('name', event.target.value)} /></label>
          <label>Professional title<input value={String(draft.professionalTitle || '')} onChange={(event) => handleDraftChange('professionalTitle', event.target.value)} /></label>
          <label>Introduction<textarea value={String(draft.shortBio || '')} onChange={(event) => handleDraftChange('shortBio', event.target.value)} /></label>
          <label>Email<input type="email" value={String(draft.email || '')} onChange={(event) => handleDraftChange('email', event.target.value)} /></label>
          <label>GitHub URL<input type="url" value={String(draft.githubUrl || '')} onChange={(event) => handleDraftChange('githubUrl', event.target.value)} /></label>
          <label>LinkedIn URL<input type="url" value={String(draft.linkedinUrl || '')} onChange={(event) => handleDraftChange('linkedinUrl', event.target.value)} /></label>
          <label>
            Profile photo (JPG, PNG or WebP, up to 8 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleProfilePhotoUpload(event.target.files?.[0])} />
            <small>{uploadingProfilePhoto ? 'Uploading...' : draft.profileImageFileId ? 'Photo stored in MongoDB. Upload another anytime to replace it.' : 'No profile photo uploaded yet.'}</small>
          </label>
          <label>Or use an existing image URL<input type="url" value={String(draft.profileImage || '')} onChange={(event) => handleDraftChange('profileImage', event.target.value)} /></label>
          <h4>Home feature strip and custom fields</h4>
          {renderPageFieldsEditor()}
        </>
      );
    }

    if (activeTab === 'about') {
      return <>{renderPageFieldsEditor()}</>;
    }

    if (activeTab === 'page-content') {
      return (
        <>
          <label>Portfolio page
            <select
              value={selectedContentPage}
              onChange={(event) => {
                setSelectedContentPage(event.target.value);
                setPageFields(getPageFields(profile, event.target.value));
                navigate(`/admin/page-content/${event.target.value}`);
              }}
            >
              {PAGE_CONTENT_PAGES.map((page) => <option key={page.key} value={page.key}>{page.label}</option>)}
            </select>
          </label>
          {renderPageFieldsEditor()}
        </>
      );
    }

    if (activeTab === 'gallery') {
      return (
        <>
          <label>Photo title<input required maxLength={120} value={String(draft.title || '')} onChange={(event) => handleDraftChange('title', event.target.value)} /></label>
          <label>Caption<textarea maxLength={500} value={String(draft.caption || '')} onChange={(event) => handleDraftChange('caption', event.target.value)} /></label>
          <label>
            Photo (JPG, PNG or WebP, up to 12 MB)
            <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} />
            {photoFile ? <small>{photoFile.name}</small> : null}
          </label>
        </>
      );
    }

    if (activeTab === 'projects') {
      return (
        <>
          <label>Title<input required value={String(draft.title || '')} onChange={(event) => handleDraftChange('title', event.target.value)} /></label>
          <label>Slug<input required value={String(draft.slug || '')} onChange={(event) => handleDraftChange('slug', event.target.value)} /></label>
          <label>Description<textarea required value={String(draft.description || '')} onChange={(event) => handleDraftChange('description', event.target.value)} /></label>
          <label>Long Description<textarea required value={String(draft.longDescription || '')} onChange={(event) => handleDraftChange('longDescription', event.target.value)} /></label>
          <label>Technologies<input value={String(draft.technologies || '')} onChange={(event) => handleDraftChange('technologies', event.target.value)} /></label>
          <label>Features<input value={String(draft.features || '')} onChange={(event) => handleDraftChange('features', event.target.value)} /></label>
          <label>Problem<textarea value={String(draft.problem || '')} onChange={(event) => handleDraftChange('problem', event.target.value)} /></label>
          <label>Solution<textarea value={String(draft.solution || '')} onChange={(event) => handleDraftChange('solution', event.target.value)} /></label>
          <label>Architecture<textarea value={String(draft.architecture || '')} onChange={(event) => handleDraftChange('architecture', event.target.value)} /></label>
          <label>Authentication<textarea value={String(draft.auth || '')} onChange={(event) => handleDraftChange('auth', event.target.value)} /></label>
          <label>Database<textarea value={String(draft.database || '')} onChange={(event) => handleDraftChange('database', event.target.value)} /></label>
          <label>AI Integration<textarea value={String(draft.aiIntegration || '')} onChange={(event) => handleDraftChange('aiIntegration', event.target.value)} /></label>
          <label>Challenges (comma-separated)<textarea value={String(draft.challenges || '')} onChange={(event) => handleDraftChange('challenges', event.target.value)} /></label>
          <label>Future Improvements (comma-separated)<textarea value={String(draft.futureImprovements || '')} onChange={(event) => handleDraftChange('futureImprovements', event.target.value)} /></label>
          <label>GitHub URL<input value={String(draft.githubUrl || '')} onChange={(event) => handleDraftChange('githubUrl', event.target.value)} /></label>
          <label>Live URL<input value={String(draft.liveUrl || '')} onChange={(event) => handleDraftChange('liveUrl', event.target.value)} /></label>
          <label>
            Project image (JPG, PNG or WebP, up to 12 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleContentImageUpload('image', event.target.files?.[0])} />
            {uploadingImageField === 'image' ? <small>Uploading to MongoDB...</small> : null}
          </label>
          <label>Or use an existing image URL<input type="url" value={String(draft.image || '')} onChange={(event) => handleDraftChange('image', event.target.value)} /></label>
          <label>Start Date<input type="date" value={String(draft.startDate || '')} onChange={(event) => handleDraftChange('startDate', event.target.value)} /></label>
          <label>End Date<input type="date" value={String(draft.endDate || '')} onChange={(event) => handleDraftChange('endDate', event.target.value)} /></label>
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
          <label>
            Certificate image (JPG, PNG or WebP, up to 12 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleContentImageUpload('certificateImage', event.target.files?.[0])} />
            {uploadingImageField === 'certificateImage' ? <small>Uploading to MongoDB...</small> : null}
          </label>
          <label>Or use an existing image URL<input type="url" value={String(draft.certificateImage || '')} onChange={(event) => handleDraftChange('certificateImage', event.target.value)} /></label>
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
          <label>
            Achievement image (JPG, PNG or WebP, up to 12 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleContentImageUpload('image', event.target.files?.[0])} />
            {uploadingImageField === 'image' ? <small>Uploading to MongoDB...</small> : null}
          </label>
          <label>Or use an existing image URL<input type="url" value={String(draft.image || '')} onChange={(event) => handleDraftChange('image', event.target.value)} /></label>
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
          <label>
            Profile Photo (JPG, PNG or WebP, up to 8 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleProfilePhotoUpload(event.target.files?.[0])} />
            <small>{uploadingProfilePhoto ? 'Uploading...' : draft.profileImageFileId ? 'Photo stored in MongoDB. Upload another anytime to replace it.' : 'No profile photo uploaded yet.'}</small>
          </label>
          <label>Or use an existing image URL<input type="url" value={String(draft.profileImage || '')} onChange={(event) => handleDraftChange('profileImage', event.target.value)} /></label>
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
                resetDraft(tab.key);
                navigate(`/admin/${tab.key}`);
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
