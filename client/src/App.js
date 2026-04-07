import './App.css';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import AlgorithmVisualizer from './components/AlgorithmVisualizer';
import PerformanceAnalyzer from './components/PerformanceAnalyzer';
import ComparisonPage from './components/ComparisonPage';
import AIAssistantPanel from './components/AIAssistantPanel';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'visualizer', label: 'Algorithm Visualizer' },
  { key: 'comparison', label: 'Comparison Page' },
  { key: 'ai', label: 'AI Assistant Panel' },
  { key: 'profile', label: 'User Profile' },
  { key: 'admin', label: 'Admin Panel' }
];

const DEFAULT_ALGORITHMS = [
  { unit: 'Unit I', names: ['Merge Sort', 'Quick Sort', 'Binary Search', 'Heap Sort'] },
  { unit: 'Unit II', names: ['Fractional Knapsack', 'Huffman Coding', 'Kruskal', 'Prim', 'Dijkstra'] },
  { unit: 'Unit III', names: ['Matrix Chain Multiplication', '0/1 Knapsack', 'Floyd Warshall', 'Multistage Graph'] },
  { unit: 'Unit IV', names: ['N-Queens', 'Graph Coloring', 'Hamiltonian Cycle', 'Branch & Bound Knapsack'] },
  { unit: 'Unit V', names: ['Fibonacci Heap', 'Max Flow', 'Approximation Algorithm demo', 'NP-Complete visualization'] }
];

const toArray = (text) =>
  text
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value));

const randomArrayText = (count = 12) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 90) + 10).join(', ');

function App() {
  const [selectedModule, setSelectedModule] = useState('dashboard');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('Merge Sort');
  const [algorithms, setAlgorithms] = useState(DEFAULT_ALGORITHMS);
  const [arrayText, setArrayText] = useState('38, 27, 43, 3, 9, 82, 10');
  const [inputArray, setInputArray] = useState(toArray('38, 27, 43, 3, 9, 82, 10'));
  const [graphData, setGraphData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [dashboardMessage, setDashboardMessage] = useState('System ready for algorithm analysis.');
  const [auth, setAuth] = useState({ token: '', user: null });

  useEffect(() => {
    const loadAlgorithms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/algorithms`);
        const data = await response.json();
        if (!data.algorithms) return;

        const grouped = data.algorithms.reduce((acc, item) => {
          const key = item.category || 'Other';
          if (!acc[key]) acc[key] = [];
          acc[key].push(item.name);
          return acc;
        }, {});

        const mapped = Object.entries(grouped).map(([unit, names]) => ({ unit, names }));
        if (mapped.length) setAlgorithms(mapped);
      } catch (error) {
        setDashboardMessage('Backend algorithms list unavailable. Using local syllabus catalog.');
      }
    };

    loadAlgorithms();
  }, []);

  const applyArray = () => {
    const parsed = toArray(arrayText);
    if (!parsed.length) {
      setDashboardMessage('Please provide comma-separated numeric values for array input.');
      return;
    }
    setInputArray(parsed);
    setDashboardMessage(`Applied custom input with ${parsed.length} elements.`);
  };

  const applyRandomArray = () => {
    const text = randomArrayText(14);
    setArrayText(text);
    setInputArray(toArray(text));
    setDashboardMessage('Random test case generated successfully.');
  };

  const handleResult = async (summary) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...summary, algorithm: selectedAlgorithm })
      });
      const data = await response.json();
      setPerformanceData(data);

      if (auth.token) {
        await fetch(`${API_BASE_URL}/api/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`
          },
          body: JSON.stringify({
            algorithm: selectedAlgorithm,
            operations: data.operations,
            executionTimeMs: data.executionTimeMs,
            inputSummary: JSON.stringify(inputArray.slice(0, 8))
          })
        });
      }
    } catch (error) {
      setDashboardMessage('Performance API unavailable; local execution still completed.');
    }
  };

  const requestVideoScript = async (algorithm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, task: 'video' })
      });
      const data = await response.json();
      if (Array.isArray(data.explanation)) return data.explanation;
      return [];
    } catch (error) {
      return [];
    }
  };

  const totalAlgorithmCount = useMemo(
    () => algorithms.reduce((total, group) => total + group.names.length, 0),
    [algorithms]
  );

  const renderMainModule = () => {
    if (selectedModule === 'dashboard') {
      return (
        <section className="panel-card">
          <h3>Dashboard</h3>
          <div className="metric-grid">
            <div>
              <p className="metric-label">Algorithms Covered</p>
              <p>{totalAlgorithmCount}</p>
            </div>
            <div>
              <p className="metric-label">Selected Algorithm</p>
              <p>{selectedAlgorithm}</p>
            </div>
            <div>
              <p className="metric-label">Authentication</p>
              <p>{auth.token ? 'Logged In' : 'Guest Mode'}</p>
            </div>
            <div>
              <p className="metric-label">Database Status</p>
              <p>Available via /health endpoint</p>
            </div>
          </div>
          <p>{dashboardMessage}</p>
        </section>
      );
    }

    if (selectedModule === 'visualizer') {
      return (
        <>
          <InputPanel
            arrayText={arrayText}
            setArrayText={setArrayText}
            onApplyArray={applyArray}
            onRandomArray={applyRandomArray}
            onGraphChange={setGraphData}
          />
          <AlgorithmVisualizer
            algorithm={selectedAlgorithm}
            sourceArray={inputArray}
            sourceGraph={graphData}
            onResult={handleResult}
            onVideoScript={requestVideoScript}
          />
          <PerformanceAnalyzer performance={performanceData} />
        </>
      );
    }

    if (selectedModule === 'comparison') {
      return <ComparisonPage algorithms={algorithms} apiBaseUrl={API_BASE_URL} />;
    }

    if (selectedModule === 'ai') {
      return <AIAssistantPanel apiBaseUrl={API_BASE_URL} algorithm={selectedAlgorithm} />;
    }

    if (selectedModule === 'profile') {
      return <UserProfile apiBaseUrl={API_BASE_URL} auth={auth} setAuth={setAuth} />;
    }

    if (selectedModule === 'admin') {
      return <AdminPanel apiBaseUrl={API_BASE_URL} auth={auth} />;
    }

    return null;
  };

  return (
    <div className="app-shell">
      <Sidebar
        modules={MODULES}
        selectedModule={selectedModule}
        onModuleSelect={setSelectedModule}
        algorithms={algorithms}
        selectedAlgorithm={selectedAlgorithm}
        onSelect={setSelectedAlgorithm}
      />
      <main className="main-panel">
        <section className="hero-block">
          <p className="eyebrow">Design And Analysis Playground</p>
          <h1>Algoverse</h1>
          <p className="hero-copy">
            AI-powered algorithm visualization, performance analysis, comparison, and profile tracking.
          </p>
        </section>
        {renderMainModule()}
      </main>
    </div>
  );
}

export default App;
