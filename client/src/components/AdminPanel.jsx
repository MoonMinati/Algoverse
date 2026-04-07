import React, { useEffect, useState } from 'react';

const AdminPanel = ({ apiBaseUrl, auth }) => {
  const [users, setUsers] = useState([]);
  const [usage, setUsage] = useState({ totalExecutions: 0, recentExecutions: [] });
  const [newAlgorithm, setNewAlgorithm] = useState({ name: '', category: '', complexityTime: '', complexitySpace: '' });
  const [status, setStatus] = useState('');

  const request = async (path, method = 'GET', body) => {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return response.json();
  };

  const refresh = async () => {
    const usersRes = await request('/api/admin/users');
    const usageRes = await request('/api/admin/usage');
    if (usersRes.error) return setStatus(usersRes.error);
    setUsers(usersRes.users || []);
    setUsage(usageRes || { totalExecutions: 0, recentExecutions: [] });
  };

  useEffect(() => {
    if (auth.user?.role === 'admin') {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.role]);

  const addAlgorithm = async () => {
    const response = await request('/api/admin/algorithms', 'POST', newAlgorithm);
    setStatus(response.error || 'Algorithm added');
    if (!response.error) {
      setNewAlgorithm({ name: '', category: '', complexityTime: '', complexitySpace: '' });
    }
  };

  if (!auth.token) {
    return <section className="panel-card"><h3>Admin Panel</h3><p>Login required.</p></section>;
  }

  if (auth.user?.role !== 'admin') {
    return <section className="panel-card"><h3>Admin Panel</h3><p>Admin access required.</p></section>;
  }

  return (
    <section className="panel-card">
      <h3>Admin Panel</h3>
      <p>Total Executions: {usage.totalExecutions}</p>
      <h4>Manage Users</h4>
      <ul>
        {users.map((user) => <li key={user._id}>{user.username} - {user.email} ({user.role})</li>)}
      </ul>

      <h4>Add New Algorithm</h4>
      <div className="input-grid">
        <label>
          Name
          <input value={newAlgorithm.name} onChange={(e) => setNewAlgorithm({ ...newAlgorithm, name: e.target.value })} />
        </label>
        <label>
          Category
          <input value={newAlgorithm.category} onChange={(e) => setNewAlgorithm({ ...newAlgorithm, category: e.target.value })} />
        </label>
        <label>
          Time Complexity
          <input value={newAlgorithm.complexityTime} onChange={(e) => setNewAlgorithm({ ...newAlgorithm, complexityTime: e.target.value })} />
        </label>
        <label>
          Space Complexity
          <input value={newAlgorithm.complexitySpace} onChange={(e) => setNewAlgorithm({ ...newAlgorithm, complexitySpace: e.target.value })} />
        </label>
        <button type="button" onClick={addAlgorithm}>Add Algorithm</button>
      </div>
      <p>{status}</p>
    </section>
  );
};

export default AdminPanel;
