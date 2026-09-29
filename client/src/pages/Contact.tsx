import { useState } from 'react';
import type { FormEvent } from 'react';
import SectionHeader from '../components/SectionHeader';
import { messageService } from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.subject.trim()) nextErrors.subject = 'Subject is required.';
    if (!form.message.trim()) nextErrors.message = 'Message is required.';
    else if (form.message.trim().length < 20) nextErrors.message = 'Message must be at least 20 characters long.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('idle');
    setFeedback('');

    if (!validate()) {
      setStatus('error');
      setFeedback('Please fix the highlighted fields and try again.');
      return;
    }

    try {
      setStatus('loading');
      const response = await messageService.create(form);
      setStatus('success');
      setFeedback(response.data.emailDeliveryStatus === 'sent'
        ? 'Your message was sent. An email notification has been delivered.'
        : response.data.emailDeliveryStatus === 'failed'
          ? 'Your message was saved, but email delivery failed. It is still available in the admin inbox.'
          : 'Your message was saved in the admin inbox. Email notifications are not configured yet.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (error) {
      setStatus('error');
      setFeedback(error instanceof Error ? error.message : 'Unable to send message right now.');
    }
  };

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Contact"
        title="Let’s connect for opportunities, collaboration and technical conversations"
        description="Share your project idea, job opportunity, or technical question."
      />

      <div className="contact-wrap">
        <form className="card contact-form" onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(errors.name)} />
            {errors.name ? <small>{errors.name}</small> : null}
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={Boolean(errors.email)} />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>
          <label>
            Subject
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} aria-invalid={Boolean(errors.subject)} />
            {errors.subject ? <small>{errors.subject}</small> : null}
          </label>
          <label>
            Message
            <textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={Boolean(errors.message)} />
            {errors.message ? <small>{errors.message}</small> : null}
          </label>

          {feedback ? <p className={`form-feedback ${status}`}>{feedback}</p> : null}

          <button type="submit" className="button primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
