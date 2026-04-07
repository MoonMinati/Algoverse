import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const randomArray = (count = 60) => Array.from({ length: count }, () => Math.floor(Math.random() * 1000));

const runLocalAlgo = (name, input) => {
  const arr = [...input];
  let ops = 0;
  const start = performance.now();

  if (name === 'Quick Sort') {
    const quickSort = (low, high) => {
      if (low >= high) return;
      let i = low;
      let j = high;
      const pivot = arr[Math.floor((low + high) / 2)];
      while (i <= j) {
        while (arr[i] < pivot) { i += 1; ops += 1; }
        while (arr[j] > pivot) { j -= 1; ops += 1; }
        if (i <= j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          i += 1;
          j -= 1;
          ops += 1;
        }
      }
      quickSort(low, j);
      quickSort(i, high);
    };
    quickSort(0, arr.length - 1);
  } else {
    for (let i = 0; i < arr.length; i += 1) {
      for (let j = 0; j < arr.length - i - 1; j += 1) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
        ops += 1;
      }
    }
  }

  const end = performance.now();
  return { ms: Number((end - start).toFixed(2)), ops };
};

const ComparisonPage = ({ algorithms, apiBaseUrl }) => {
  const [first, setFirst] = useState('Merge Sort');
  const [second, setSecond] = useState('Quick Sort');
  const [result, setResult] = useState(null);
  const [serverInsight, setServerInsight] = useState('Run comparison to view best-use-case suggestion.');

  const candidates = useMemo(() => {
    const names = algorithms.flatMap((item) => item.names);
    return names.filter((name) => ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Binary Search'].includes(name));
  }, [algorithms]);

  const runComparison = async () => {
    const input = randomArray();
    const firstResult = runLocalAlgo(first, input);
    const secondResult = runLocalAlgo(second, input);
    setResult({ first: firstResult, second: secondResult });

    try {
      const response = await fetch(`${apiBaseUrl}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first,
          second,
          firstMs: firstResult.ms,
          secondMs: secondResult.ms,
          firstOps: firstResult.ops,
          secondOps: secondResult.ops
        })
      });
      const data = await response.json();
      setServerInsight(`${data.bestUseCase} Winner: ${data.winner}`);
    } catch (error) {
      setServerInsight('Comparison backend unavailable; local metrics shown only.');
    }
  };

  const chartData = result
    ? {
        labels: [first, second],
        datasets: [
          {
            label: 'Execution time (ms)',
            data: [result.first.ms, result.second.ms],
            backgroundColor: ['#0f766e', '#e07a3f']
          },
          {
            label: 'Operation count',
            data: [result.first.ops, result.second.ops],
            backgroundColor: ['#1f2432', '#5c677d']
          }
        ]
      }
    : null;

  return (
    <section className="panel-card">
      <div className="panel-head">
        <h3>Comparison Page</h3>
        <button type="button" onClick={runComparison}>Run Comparison</button>
      </div>
      <div className="comparison-controls">
        <label>
          Algorithm A
          <select value={first} onChange={(event) => setFirst(event.target.value)}>
            {candidates.map((name) => <option key={`first-${name}`}>{name}</option>)}
          </select>
        </label>
        <label>
          Algorithm B
          <select value={second} onChange={(event) => setSecond(event.target.value)}>
            {candidates.map((name) => <option key={`second-${name}`}>{name}</option>)}
          </select>
        </label>
      </div>
      {chartData && <Bar data={chartData} />}
      <p>{serverInsight}</p>
    </section>
  );
};

export default ComparisonPage;
