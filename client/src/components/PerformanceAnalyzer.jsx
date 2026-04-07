import React from 'react';

const PerformanceAnalyzer = ({ performance }) => {
  if (!performance) {
    return (
      <section className="panel-card">
        <h3>Performance Analyzer</h3>
        <p>Run an algorithm to see complexity, operations count, and execution time.</p>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <h3>Performance Analyzer</h3>
      <div className="metric-grid">
        <div>
          <p className="metric-label">Algorithm</p>
          <p>{performance.algorithm}</p>
        </div>
        <div>
          <p className="metric-label">Operations</p>
          <p>{performance.operations}</p>
        </div>
        <div>
          <p className="metric-label">Execution Time</p>
          <p>{performance.executionTimeMs} ms</p>
        </div>
        <div>
          <p className="metric-label">Time Complexity</p>
          <p>{performance.timeComplexity}</p>
        </div>
        <div>
          <p className="metric-label">Space Complexity</p>
          <p>{performance.spaceComplexity}</p>
        </div>
      </div>
    </section>
  );
};

export default PerformanceAnalyzer;
