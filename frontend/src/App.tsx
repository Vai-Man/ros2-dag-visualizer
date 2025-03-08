import React from "react";
import DAGVisualizer from "./components/DAGVisualizer";

const App: React.FC = () => {
  return (
    <div>
      <h2>Directed Acyclic Graph (DAG) Visualizer</h2>
      <DAGVisualizer />
    </div>
  );
};

export default App;
