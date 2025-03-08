const rclnodejs = require("rclnodejs");
const WebSocket = require("ws");

async function main() {
  await rclnodejs.init();
  const node = new rclnodejs.Node("ros2_graph_visualizer");

  // WebSocket Server
  const wss = new WebSocket.Server({ port: 8080 });

  node.createSubscription("std_msgs/msg/String", "/rosout", (msg) => {
    console.log(`Received: ${msg.data}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "log", data: msg.data }));
      }
    });
  });

  function sendDAGUpdate() {
    const dagData = {
      type: "dag_update",
      nodes: [
        { id: "A", metadata: "Start Node" },
        { id: "B", metadata: "Intermediate Node (Disabled)", disabled: true },
        { id: "C", metadata: "Process Step" },
        { id: "D", metadata: "Final Step" }
      ],
      edges: [
        { source: "A", target: "B", label: "CommandInterface", type: "command" },
        { source: "B", target: "C", label: "CommandInterface", type: "command" },
        { source: "C", target: "D", label: "CommandInterface", type: "command" },
        { source: "D", target: "A", label: "StateInterface", type: "state" },
        { source: "D", target: "B", label: "StateInterface", type: "state" }
      ]
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
  rclnodejs.spin(node);
}

main();
