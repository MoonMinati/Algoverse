import React, { useEffect, useState } from 'react';

const UserProfile = ({ apiBaseUrl, auth, setAuth }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [verifyToken, setVerifyToken] = useState('');
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');

  const request = async (path, method = 'GET', body) => {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return response.json();
  };

  const refresh = async () => {
    if (!auth.token) return;
    const profileData = await request('/api/profile');
    const historyData = await request('/api/history');
    const resultData = await request('/api/results');
    setProfile(profileData.user || null);
    setHistory(historyData.history || []);
    setResults(resultData.results || []);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  const register = async () => {
    const data = await request('/api/auth/register', 'POST', form);
    if (data.error) return setStatus(data.error);
    setAuth({ token: data.token, user: data.user });
    if (data.verificationToken) {
      setVerifyToken(data.verificationToken);
      setStatus('Registered. Verification token auto-filled below for free local email verification.');
    } else {
      setStatus('Registered. Verify email before login.');
    }
  };

  const verify = async () => {
    const data = await request('/api/auth/verify-email', 'POST', { token: verifyToken });
    setStatus(data.message || data.error || 'Verification response received');
  };

  const login = async () => {
    const data = await request('/api/auth/login', 'POST', { email: form.email, password: form.password });
    if (data.error) return setStatus(data.error);
    setAuth({ token: data.token, user: data.user });
    setStatus('Logged in successfully');
  };

  const logout = () => {
    setAuth({ token: '', user: null });
    setProfile(null);
    setHistory([]);
    setResults([]);
    setStatus('Logged out');
  };

  return (
    <section className="panel-card">
      <h3>User Profile</h3>
      {!auth.token ? (
        <div className="input-grid">
          <label>
            Username
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <div className="horizontal-gap">
            <button type="button" onClick={register}>Signup</button>
            <button type="button" onClick={login}>Login</button>
          </div>
          <label>
            Email verification token
            <input value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} />
          </label>
          <button type="button" onClick={verify}>Verify Email</button>
        </div>
      ) : (
        <div>
          <p><strong>User:</strong> {auth.user?.username} ({auth.user?.email})</p>
          <p><strong>Role:</strong> {auth.user?.role}</p>
          <button type="button" onClick={logout}>Logout</button>
          <h4>Execution History</h4>
          <ul>
            {history.map((item, index) => <li key={`${item.algorithm}-${index}`}>{item.algorithm} - {new Date(item.date).toLocaleString()}</li>)}
          </ul>
          <h4>Saved Results</h4>
          <ul>
            {results.map((item) => <li key={item._id}>{item.title}</li>)}
          </ul>
        </div>
      )}
      <p>{status}</p>
      {profile && <p>Verified: {String(profile.isVerified)}</p>}
    </section>
  );
};

export default UserProfile;
