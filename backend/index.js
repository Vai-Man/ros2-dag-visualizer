const rclnodejs = require("rclnodejs");
const WebSocket = require("ws");

async function main() {
  console.log("Starting ROS 2 Graph Visualizer backend...");

  await rclnodejs.init();
  const node = new rclnodejs.Node("ros2_graph_visualizer");

  console.log("ROS 2 node initialized and running...");

  // WebSocket Server (Backend)
  const wss = new WebSocket.Server({ port: 8080 });
  console.log("WebSocket server running on ws://localhost:8080");

  wss.on("connection", (ws) => {
    console.log("🌐 New WebSocket client connected.");
  });

  // ROS 2 Subscription
  const GraphEdge = rclnodejs.require("ros2_graph_visualizer/msg/GraphEdge");

  node.createSubscription(GraphEdge, "/graph_updates", (msg) => {
    console.log(`✅ Received ROS 2 message: ${JSON.stringify(msg)}`);

    // Broadcast to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("🚀 Sending message to WebSocket frontend...");
        client.send(JSON.stringify(msg));
      }
    });
  });

  console.log("📡 Listening for ROS 2 messages...");

  // ✅ FIX: Run `spin(node)` in a separate async function
  async function runSpin() {
    await rclnodejs.spin(node);
  }
  runSpin();

  // ✅ FIX: Handle process exit properly
  process.on("SIGINT", () => {
    console.log("Shutting down backend...");
    node.destroy().then(() => {
      wss.close();
      process.exit(0);
    });
  });
}

main();
