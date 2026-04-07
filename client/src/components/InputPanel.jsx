import React, { useState } from 'react';

const randomGraph = () => ({
  nodes: [
    { id: 'A', x: 70, y: 65 },
    { id: 'B', x: 210, y: 60 },
    { id: 'C', x: 330, y: 120 },
    { id: 'D', x: 120, y: 210 },
    { id: 'E', x: 280, y: 220 }
  ],
  edges: [
    { from: 'A', to: 'B', weight: 2 },
    { from: 'B', to: 'C', weight: 4 },
    { from: 'A', to: 'D', weight: 5 },
    { from: 'D', to: 'E', weight: 1 },
    { from: 'C', to: 'E', weight: 3 }
  ]
});

const InputPanel = ({ arrayText, setArrayText, onApplyArray, onRandomArray, onGraphChange }) => {
  const [graphText, setGraphText] = useState(JSON.stringify(randomGraph(), null, 2));

  const applyGraph = () => {
    try {
      const parsed = JSON.parse(graphText);
      onGraphChange(parsed);
    } catch (error) {
      onGraphChange(null);
    }
  };

  const uploadGraph = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setGraphText(text);
      try {
        onGraphChange(JSON.parse(text));
      } catch (error) {
        onGraphChange(null);
      }
    };
    reader.readAsText(file);
  };

  const generateGraph = () => {
    const next = randomGraph();
    setGraphText(JSON.stringify(next, null, 2));
    onGraphChange(next);
  };

  return (
    <section className="panel-card">
      <h3>Input Panel</h3>
      <div className="input-grid">
        <label>
          Enter array
          <input value={arrayText} onChange={(event) => setArrayText(event.target.value)} placeholder="38, 27, 43, 3" />
        </label>
        <div className="horizontal-gap">
          <button type="button" onClick={onApplyArray}>Apply Array</button>
          <button type="button" className="ghost" onClick={onRandomArray}>Generate Random Data</button>
        </div>
        <label>
          Upload graph JSON
          <input type="file" accept="application/json" onChange={uploadGraph} />
        </label>
        <label>
          Graph JSON
          <textarea value={graphText} onChange={(event) => setGraphText(event.target.value)} rows={9} />
        </label>
        <div className="horizontal-gap">
          <button type="button" onClick={applyGraph}>Apply Graph</button>
          <button type="button" className="ghost" onClick={generateGraph}>Generate Random Graph</button>
        </div>
      </div>
    </section>
  );
};

export default InputPanel;
