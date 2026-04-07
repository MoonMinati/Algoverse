import React, { useState } from 'react';

const AIAssistantPanel = ({ apiBaseUrl, algorithm }) => {
  const [task, setTask] = useState('explain');
  const [result, setResult] = useState('AI output appears here.');
  const [loading, setLoading] = useState(false);

  const labels = {
    explain: 'Simple explanation',
    code: 'Generate code',
    example: 'Generate examples',
    video: 'Video narration steps'
  };

  const runTask = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, task })
      });
      const data = await response.json();
      if (Array.isArray(data.explanation)) {
        setResult(data.explanation.join('\n'));
      } else {
        setResult(data.explanation || 'No response from AI');
      }
    } catch (error) {
      setResult('AI service unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-head">
        <h3>AI Assistant Panel</h3>
        <button type="button" onClick={runTask} disabled={loading}>{loading ? 'Running...' : 'Run AI Task'}</button>
      </div>
      <label>
        Action
        <select value={task} onChange={(event) => setTask(event.target.value)}>
          {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <pre className="code-block">{result}</pre>
    </section>
  );
};

export default AIAssistantPanel;
