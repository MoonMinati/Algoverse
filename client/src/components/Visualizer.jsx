import React, { useState } from 'react';
import { sleep } from '../utils/animate';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_LENGTH = 14;

const randomArray = (length = DEFAULT_LENGTH) =>
  Array.from({ length }, () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE)) + MIN_VALUE);

const buildMergeSortSteps = (input) => {
  const arr = [...input];
  const steps = [];

  const mergeSort = (start, end) => {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    mergeSort(start, mid);
    mergeSort(mid + 1, end);
    merge(start, mid, end);
  };

  const merge = (start, mid, end) => {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    let i = 0;
    let j = 0;
    let k = start;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i += 1;
      } else {
        arr[k] = right[j];
        j += 1;
      }
      steps.push({ array: [...arr], active: [k] });
      k += 1;
    }

    while (i < left.length) {
      arr[k] = left[i];
      steps.push({ array: [...arr], active: [k] });
      i += 1;
      k += 1;
    }

    while (j < right.length) {
      arr[k] = right[j];
      steps.push({ array: [...arr], active: [k] });
      j += 1;
      k += 1;
    }
  };

  mergeSort(0, arr.length - 1);
  return steps;
};

const buildQuickSortSteps = (input) => {
  const arr = [...input];
  const steps = [];

  const quickSort = (low, high) => {
    if (low >= high) return;
    const pi = partition(low, high);
    quickSort(low, pi - 1);
    quickSort(pi + 1, high);
  };

  const partition = (low, high) => {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j += 1) {
      if (arr[j] <= pivot) {
        i += 1;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ array: [...arr], active: [i, j, high] });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ array: [...arr], active: [i + 1, high] });
    return i + 1;
  };

  quickSort(0, arr.length - 1);
  return steps;
};

const Visualizer = ({ algorithm }) => {
  const [array, setArray] = useState(randomArray());
  const [activeIndices, setActiveIndices] = useState([]);
  const [target, setTarget] = useState(null);
  const [foundIndex, setFoundIndex] = useState(null);
  const [statusText, setStatusText] = useState('Ready');
  const [isSorting, setIsSorting] = useState(false);

  const resetData = () => {
    const next = randomArray();
    if (algorithm === 'Binary Search') {
      next.sort((a, b) => a - b);
    }
    setArray(next);
    setActiveIndices([]);
    setFoundIndex(null);
    setStatusText('Ready');
  };

  const runSort = async (stepsBuilder) => {
    setIsSorting(true);
    setFoundIndex(null);
    const steps = stepsBuilder(array);

    for (const step of steps) {
      setArray(step.array);
      setActiveIndices(step.active);
      await sleep(120);
    }

    setActiveIndices([]);
    setStatusText('Done');
    setIsSorting(false);
  };

  const runBinarySearch = async () => {
    setIsSorting(true);
    setFoundIndex(null);

    const sorted = [...array].sort((a, b) => a - b);
    const chosenTarget = sorted[Math.floor(Math.random() * sorted.length)];
    setArray(sorted);
    setTarget(chosenTarget);

    let low = 0;
    let high = sorted.length - 1;
    let found = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      setActiveIndices([low, mid, high]);
      setStatusText(`Searching for ${chosenTarget}...`);
      await sleep(300);

      if (sorted[mid] === chosenTarget) {
        found = mid;
        break;
      }

      if (sorted[mid] < chosenTarget) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    setFoundIndex(found >= 0 ? found : null);
    setActiveIndices([]);
    setStatusText(found >= 0 ? `Found ${chosenTarget} at index ${found}` : `${chosenTarget} not found`);
    setIsSorting(false);
  };

  const runVisualization = async () => {
    if (isSorting) return;
    setStatusText('Running...');

    if (algorithm === 'Merge Sort') {
      await runSort(buildMergeSortSteps);
      return;
    }

    if (algorithm === 'Quick Sort') {
      await runSort(buildQuickSortSteps);
      return;
    }

    if (algorithm === 'Binary Search') {
      await runBinarySearch();
      return;
    }

    setStatusText('Visualization not implemented for this algorithm yet.');
  };

  return (
    <div className="visualizer-card">
      <div className="visualizer-header">
        <h2>{algorithm} Visualization</h2>
        <span className="status-pill">{statusText}</span>
      </div>

      {target !== null && <p className="target-label">Target: {target}</p>}

      <div className="bars-wrap" role="img" aria-label={`${algorithm} bar visualization`}>
        {array.map((val, idx) => (
          <div
            key={idx}
            className={[
              'bar',
              activeIndices.includes(idx) ? 'is-active' : '',
              foundIndex === idx ? 'is-found' : ''
            ].join(' ')}
            style={{ height: `${Math.max(18, val * 2.3)}px` }}
            title={`Index ${idx}: ${val}`}
          >
            <span>{val}</span>
          </div>
        ))}
      </div>

      <div className="viz-actions">
        <button type="button" onClick={runVisualization} disabled={isSorting}>
          {isSorting ? 'Running...' : 'Start Visualization'}
        </button>
        <button type="button" className="ghost" onClick={resetData} disabled={isSorting}>
          Shuffle Data
        </button>
      </div>
    </div>
  );
};

export default Visualizer;