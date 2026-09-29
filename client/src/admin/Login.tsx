import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setAuthToken } from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      setAuthToken(response.data.token);
      navigate('/admin/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container admin-login">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <p className="form-feedback error">{error}</p> : null}
        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
