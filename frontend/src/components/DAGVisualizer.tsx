import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

cytoscape.use(dagre);

const DAGVisualizer: React.FC = () => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const positionsRef = useRef<Record<string, cytoscape.Position>>({});
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!document.getElementById("cy")) return;

    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements: [],
      style: [
        { selector: "node", style: { "background-color": "#007bff", "label": "data(id)", "text-valign": "center", color: "#fff", "shape": "ellipse" } },
        { selector: "node.disabled", style: { "background-color": "#aaa", "border-style": "dashed", opacity: 0.6 } },
        { selector: "node.hardware", style: { "background-color": "#ffcc00", "shape": "rectangle", "width": "80px", "height": "40px" } },
        { selector: "node.message", style: { "background-color": "#ffa500", "shape": "diamond" } },
        { selector: "node.parameter", style: { "background-color": "#6a0dad", "shape": "pentagon" } },
        { selector: "edge", style: { "width": 3, "curve-style": "bezier", "target-arrow-shape": "triangle", "label": "data(label)" } },
        { selector: "edge.command", style: { "line-color": "red", "target-arrow-color": "red" } },
        { selector: "edge.state", style: { "line-color": "green", "target-arrow-color": "green" } }
      ],
      layout: { name: "dagre" }
    });

    cy.on("dragfreeon", "node", (event) => {
      const node = event.target;
      positionsRef.current[node.id()] = node.position();
    });

    cy.on("tap", "node", (event) => {
      setSelectedNode(event.target.data());
    });

    cyRef.current = cy;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => console.log("WebSocket connected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket disconnected");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "log") {
        console.log("Received Log:", data.data);
      } else if (data.type === "dag_update") {
        updateDAG(data.nodes, data.edges);
      }
    };

    function updateDAG(
      nodes: {
        id: string;
        metadata?: string;
        command_interface?: boolean;
        state_interface?: boolean;
        message_interface?: boolean;
        parameter_interface?: boolean;
        is_hardware?: boolean;
        disabled?: boolean;
      }[],
      edges: { source: string; target: string; label: string; type: string }[]
    ) {
      if (!cyRef.current) return;
      const cy = cyRef.current;

      cy.nodes().forEach((node) => {
        positionsRef.current[node.id()] = node.position();
      });

      cy.elements().remove();

      cy.add(
        nodes.map((node) => ({
          data: {
            id: node.id,
            metadata: node.metadata || "N/A",
            command_interface: node.command_interface || false,
            state_interface: node.state_interface || false,
            message_interface: node.message_interface || false,
            parameter_interface: node.parameter_interface || false,
            is_hardware: node.is_hardware || false
          },
          classes: node.is_hardware
            ? "hardware"
            : node.command_interface
            ? "command"
            : node.state_interface
            ? "state"
            : node.message_interface
            ? "message"
            : node.parameter_interface
            ? "parameter"
            : node.disabled
            ? "disabled"
            : "",
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
      ws.close();
      cy.destroy();
    };
  }, []);

  return (
    <div>
      <h3>ROS2 DAG Visualizer</h3>
      <div id="cy" style={{ width: "100%", height: "500px", border: "1px solid black" }} />
      {selectedNode && (
        <div style={{ marginTop: "10px", padding: "10px", border: "1px solid gray", background: "#f8f9fa" }}>
          <strong>Node ID:</strong> {selectedNode.id} <br />
          <strong>Metadata:</strong> {selectedNode.metadata} <br />
          <strong>Command Interface:</strong> {selectedNode.command_interface ? "Yes" : "No"} <br />
          <strong>State Interface:</strong> {selectedNode.state_interface ? "Yes" : "No"} <br />
          <strong>Message Interface:</strong> {selectedNode.message_interface ? "Yes" : "No"} <br />
          <strong>Parameter Interface:</strong> {selectedNode.parameter_interface ? "Yes" : "No"} <br />
          <strong>Hardware:</strong> {selectedNode.is_hardware ? "Yes" : "No"} <br />
        </div>
      )}
    </div>
  );
};

export default DAGVisualizer;
