const rclnodejs = require("rclnodejs");
const WebSocket = require("ws");

async function main() {
  await rclnodejs.init();
  const node = new rclnodejs.Node("ros2_graph_visualizer");
  const wss = new WebSocket.Server({ port: 8080 });

  let dagNodes = {
    A: { id: "A", metadata: "Start Node", command_interface: true, state_interface: false, is_hardware: false },
    B: { id: "B", metadata: "Process Node", command_interface: true, state_interface: true, is_hardware: false },
    C: { id: "C", metadata: "Process Step", command_interface: true, state_interface: false, is_hardware: false },
    D: { id: "D", metadata: "Final Step", command_interface: false, state_interface: true, is_hardware: false },
    HW: { id: "HW", metadata: "Hardware Node", command_interface: false, state_interface: true, is_hardware: true }
  };

  let dagEdges = [
    { source: "A", target: "B", label: "CommandInterface", type: "command" },
    { source: "B", target: "C", label: "CommandInterface", type: "command" },
    { source: "C", target: "D", label: "CommandInterface", type: "command" },
    { source: "D", target: "A", label: "StateInterface", type: "state" },
    { source: "D", target: "B", label: "StateInterface", type: "state" },
    { source: "C", target: "HW", label: "Hardware Connection", type: "state" }
  ];

  node.createSubscription("std_msgs/msg/String", "/rosout", (msg) => {
    console.log(`Received log: ${msg.data}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "log", data: msg.data }));
      }
    });
  });

  function sendDAGUpdate() {
    const dagData = {
      type: "dag_update",
      nodes: Object.values(dagNodes),
      edges: dagEdges
    };

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(dagData));
      }
    });
  }

  // Send DAG update every 5 seconds
  setInterval(sendDAGUpdate, 5000);

  console.log("WebSocket Server running on ws://localhost:8080");

  process.on("SIGINT", () => {
    console.log("Shutting down...");
    node.destroy();
    wss.close();
    process.exit();
  });

  rclnodejs.spin(node);
}

main();
