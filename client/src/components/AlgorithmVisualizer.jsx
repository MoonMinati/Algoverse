import React, { useMemo, useState } from 'react';
import { scaleLinear } from 'd3';
import { sleep } from '../utils/animate';

const sortingSet = new Set(['Merge Sort', 'Quick Sort', 'Heap Sort', 'Fractional Knapsack', 'Approximation Algorithm demo']);
const graphSet = new Set(['Dijkstra', 'Kruskal', 'Prim', 'Max Flow', 'Multistage Graph', 'Fibonacci Heap']);
const dpSet = new Set(['0/1 Knapsack', 'Matrix Chain Multiplication', 'Floyd Warshall']);
const backtrackingSet = new Set(['N-Queens', 'Graph Coloring', 'Hamiltonian Cycle', 'Branch & Bound Knapsack', 'NP-Complete visualization']);

const randomArray = (count = 12) => Array.from({ length: count }, () => Math.floor(Math.random() * 90) + 10);

const defaultGraph = {
  nodes: [
    { id: 'A', x: 80, y: 70 },
    { id: 'B', x: 220, y: 60 },
    { id: 'C', x: 340, y: 120 },
    { id: 'D', x: 120, y: 190 },
    { id: 'E', x: 280, y: 220 }
  ],
  edges: [
    { from: 'A', to: 'B', weight: 2 },
    { from: 'A', to: 'D', weight: 6 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'B', to: 'E', weight: 8 },
    { from: 'D', to: 'E', weight: 5 },
    { from: 'C', to: 'E', weight: 1 }
  ]
};

const typeForAlgorithm = (algorithm) => {
  if (algorithm === 'Binary Search') return 'search';
  if (sortingSet.has(algorithm)) return 'sorting';
  if (graphSet.has(algorithm)) return 'graph';
  if (dpSet.has(algorithm)) return 'dp';
  if (backtrackingSet.has(algorithm)) return 'backtracking';
  return 'sorting';
};

const buildSortingSteps = (input) => {
  const arr = [...input];
  const steps = [];
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
      steps.push({ bars: [...arr], active: [j, j + 1] });
    }
  }
  return steps;
};

const buildBinarySearchSteps = (input) => {
  const sorted = [...input].sort((a, b) => a - b);
  const target = sorted[Math.floor(sorted.length / 2)];
  const steps = [];
  let low = 0;
  let high = sorted.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ bars: [...sorted], active: [low, mid, high], target });
    if (sorted[mid] === target) break;
    if (sorted[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return steps;
};

const buildDpSteps = () => {
  const rows = 5;
  const cols = 6;
  const table = Array.from({ length: rows }, () => Array(cols).fill(0));
  const steps = [];
  for (let r = 1; r < rows; r += 1) {
    for (let c = 1; c < cols; c += 1) {
      table[r][c] = Math.max(table[r - 1][c], table[r][c - 1]) + (r + c) % 3;
      steps.push({ table: table.map((row) => [...row]), activeCell: [r, c] });
    }
  }
  return steps;
};

const buildBacktrackingSteps = () => {
  const states = [
    ['Start'],
    ['Row1-Col1', 'Row1-Col2'],
    ['Row2-Col3', 'Backtrack', 'Row2-Col4'],
    ['Solution Candidate', 'Backtrack', 'Final Solution']
  ];
  return states.map((nodes, depth) => ({ depth, nodes }));
};

const buildGraphSteps = (graph) => graph.edges.map((edge, index) => ({ edge, index }));

const AlgorithmVisualizer = ({
  algorithm,
  sourceArray,
  sourceGraph,
  onResult,
  onVideoScript
}) => {
  const [bars, setBars] = useState(sourceArray?.length ? sourceArray : randomArray());
  const [active, setActive] = useState([]);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState(null);
  const [graphStep, setGraphStep] = useState(-1);
  const [dpTable, setDpTable] = useState([]);
  const [dpActiveCell, setDpActiveCell] = useState(null);
  const [treeSteps, setTreeSteps] = useState([]);
  const [currentTreeDepth, setCurrentTreeDepth] = useState(-1);
  const [stepText, setStepText] = useState([]);

  const graph = sourceGraph?.nodes?.length ? sourceGraph : defaultGraph;
  const kind = useMemo(() => typeForAlgorithm(algorithm), [algorithm]);
  const barScale = useMemo(() => scaleLinear().domain([0, 100]).range([26, 240]), []);

  const syncInputs = () => {
    setBars(sourceArray?.length ? sourceArray : randomArray());
    setGraphStep(-1);
    setDpTable([]);
    setTreeSteps([]);
    setCurrentTreeDepth(-1);
    setStepText([]);
    setActive([]);
    setTarget(null);
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    syncInputs();
    const start = performance.now();
    let operations = 0;
    const localStepText = [];

    if (kind === 'sorting') {
      const steps = buildSortingSteps(sourceArray?.length ? sourceArray : bars);
      for (const step of steps) {
        setBars(step.bars);
        setActive(step.active);
        operations += 1;
        if (operations % 8 === 0) {
          localStepText.push(`Operation ${operations}: compare and reorder elements.`);
        }
        await sleep(90);
      }
    }

    if (kind === 'search') {
      const steps = buildBinarySearchSteps(sourceArray?.length ? sourceArray : bars);
      for (const step of steps) {
        setBars(step.bars);
        setActive(step.active);
        setTarget(step.target);
        operations += 1;
        localStepText.push(`Step ${operations}: narrow the search window.`);
        await sleep(320);
      }
    }

    if (kind === 'graph') {
      const steps = buildGraphSteps(graph);
      for (const step of steps) {
        setGraphStep(step.index);
        operations += 1;
        localStepText.push(`Step ${operations}: traverse edge ${step.edge.from} -> ${step.edge.to}.`);
        await sleep(280);
      }
    }

    if (kind === 'dp') {
      const steps = buildDpSteps();
      for (const step of steps) {
        setDpTable(step.table);
        setDpActiveCell(step.activeCell);
        operations += 1;
        localStepText.push(`Step ${operations}: fill DP[${step.activeCell[0]}][${step.activeCell[1]}].`);
        await sleep(120);
      }
    }

    if (kind === 'backtracking') {
      const steps = buildBacktrackingSteps();
      setTreeSteps(steps);
      for (const step of steps) {
        setCurrentTreeDepth(step.depth);
        operations += 1;
        localStepText.push(`Depth ${step.depth + 1}: expand or prune state candidates.`);
        await sleep(420);
      }
    }

    const end = performance.now();
    setStepText(localStepText.slice(0, 8));
    setRunning(false);

    onResult({
      algorithm,
      operations,
      executionTimeMs: Number((end - start).toFixed(2))
    });
  };

  const runVideo = async () => {
    const script = await onVideoScript(algorithm);
    if (!script?.length) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      script.forEach((line, index) => {
        const utter = new SpeechSynthesisUtterance(line);
        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;
        utter.onstart = () => setStepText((prev) => [
          `Scene ${index + 1}: ${line}`,
          ...prev.slice(0, 6)
        ]);
        window.speechSynthesis.speak(utter);
      });
    } else {
      setStepText(script.map((line, idx) => `Scene ${idx + 1}: ${line}`));
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-head">
        <h3>Algorithm Visualizer</h3>
        <div className="horizontal-gap">
          <button type="button" onClick={run} disabled={running}>{running ? 'Running...' : 'Start Execution'}</button>
          <button type="button" className="ghost" onClick={runVideo}>Generate Explanation Video</button>
        </div>
      </div>

      {(kind === 'sorting' || kind === 'search') && (
        <div className="bars-wrap">
          {bars.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className={`bar ${active.includes(index) ? 'is-active' : ''}`}
              style={{ height: `${barScale(value)}px` }}
            >
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}

      {kind === 'search' && target !== null && <p>Current binary search target: {target}</p>}

      {kind === 'graph' && (
        <svg className="graph-canvas" viewBox="0 0 420 280" aria-label="Graph visualization">
          {graph.edges.map((edge, index) => {
            const from = graph.nodes.find((node) => node.id === edge.from);
            const to = graph.nodes.find((node) => node.id === edge.to);
            return (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className={index <= graphStep ? 'edge active' : 'edge'}
                />
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 5}>{edge.weight}</text>
              </g>
            );
          })}
          {graph.nodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r="16" className="node" />
              <text x={node.x - 5} y={node.y + 5}>{node.id}</text>
            </g>
          ))}
        </svg>
      )}

      {kind === 'dp' && (
        <div className="dp-table">
          {dpTable.map((row, r) => (
            <div key={`row-${r}`} className="dp-row">
              {row.map((cell, c) => (
                <span
                  key={`cell-${r}-${c}`}
                  className={dpActiveCell && dpActiveCell[0] === r && dpActiveCell[1] === c ? 'cell active' : 'cell'}
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {kind === 'backtracking' && (
        <div className="tree-box">
          {treeSteps.map((step) => (
            <div key={`depth-${step.depth}`} className={step.depth <= currentTreeDepth ? 'tree-level active' : 'tree-level'}>
              <strong>Depth {step.depth + 1}:</strong> {step.nodes.join(' -> ')}
            </div>
          ))}
        </div>
      )}

      <div className="steps-list">
        <h4>Step-by-Step Execution</h4>
        <ol>
          {stepText.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default AlgorithmVisualizer;
