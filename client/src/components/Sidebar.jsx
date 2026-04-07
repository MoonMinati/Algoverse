const Sidebar = ({ modules, selectedModule, onModuleSelect, algorithms, selectedAlgorithm, onSelect }) => (
  <aside className="sidebar">
    <div className="brand">
      <span className="brand-mark">A</span>
      <h2>Algoverse</h2>
    </div>

    <section className="module-block">
      <h3>Modules</h3>
      {modules.map((module) => (
        <button
          key={module.key}
          type="button"
          onClick={() => onModuleSelect(module.key)}
          className={module.key === selectedModule ? 'algo-btn active' : 'algo-btn'}
        >
          {module.label}
        </button>
      ))}
    </section>

    {algorithms.map((item) => (
      <section key={item.unit} className="unit-block">
        <h3>{item.unit}</h3>
        {item.names.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={name === selectedAlgorithm ? 'algo-btn active' : 'algo-btn'}
          >
            {name}
          </button>
        ))}
      </section>
    ))}
  </aside>
);

export default Sidebar;