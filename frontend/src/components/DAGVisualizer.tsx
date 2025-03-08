import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

cytoscape.use(dagre);

const DAGVisualizer: React.FC = () => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ id: string; metadata: string } | null>(null);
  const positionsRef = useRef<Record<string, cytoscape.Position>>({}); // Stores node positions persistently

  useEffect(() => {
    if (!document.getElementById("cy")) return;

    cyRef.current = cytoscape({
      container: document.getElementById("cy"),
      elements: [],
      style: [
        { selector: "node", style: { "background-color": "#007bff", "label": "data(id)", "text-valign": "center", color: "#fff" } },
        { selector: "node.disabled", style: { "background-color": "#aaa", "border-style": "dashed", opacity: 0.6 } },
        { selector: "edge", style: { "width": 3, "curve-style": "bezier", "target-arrow-shape": "triangle", "label": "data(label)" } },
        { selector: "edge.command", style: { "line-color": "red", "target-arrow-color": "red" } },
        { selector: "edge.state", style: { "line-color": "green", "target-arrow-color": "green" } }
      ],
      layout: { name: "dagre" }
    });

    cyRef.current.on("dragfreeon", "node", (event) => {
      const node = event.target;
      positionsRef.current[node.id()] = node.position();
    });

    // display metadata
    cyRef.current.on("tap", "node", (event) => {
      const node = event.target;
      setSelectedNode({ id: node.id(), metadata: node.data("metadata") });
    });

    // connect to websocket server
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "log") {
        console.log("Received Log:", data.data);
      } else if (data.type === "dag_update") {
        updateDAG(data.nodes, data.edges);
      }
    };

    function updateDAG(nodes: { id: string; metadata: string; disabled?: boolean }[], edges: { source: string; target: string; label: string; type: string }[]) {
      if (!cyRef.current) return;

      const cy = cyRef.current;

      // preserve positions before updating
      cy.nodes().forEach((node) => {
        positionsRef.current[node.id()] = node.position();
      });

      cy.elements().remove();
      cy.add(
        nodes.map((node) => ({
          data: { id: node.id, metadata: node.metadata },
          classes: node.disabled ? "disabled" : "",
          position: positionsRef.current[node.id] || undefined
        }))
      );

      cy.add(
        edges.map((edge) => ({
          data: { id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target, label: edge.label },
          classes: edge.type === "command" ? "command" : "state"
        }))
      );

      if (Object.keys(positionsRef.current).length === 0) {
        cy.layout({ name: "dagre" }).run();
      }
    }

    return () => {
      socket.close();
      cyRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <h3>ROS2 DAG Visualizer</h3>
      <div id="cy" style={{ width: "100%", height: "500px", border: "1px solid black" }} />
      {selectedNode && (
        <div style={{ marginTop: "10px", padding: "10px", border: "1px solid gray", background: "#f8f9fa" }}>
          <strong>Node ID:</strong> {selectedNode.id} <br />
          <strong>Metadata:</strong> {selectedNode.metadata}
        </div>
      )}
    </div>
  );
};

export default DAGVisualizer;
