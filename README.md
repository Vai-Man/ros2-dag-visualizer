# **ROS2 Graph Visualizer**  

A **TypeScript + D3.js** application for visualizing **ROS2 graphs** dynamically. This project provides an **interactive interface** to visualize, modify, and analyze ROS2 node connections in real-time, with support for **hardware differentiation, state/command interfaces, filtering options**, and **live WebSocket updates**.

---

## **Features**  
1. **Real-time Graph Rendering** – Uses **D3.js** to dynamically visualize ROS2 node connections.  
2. **WebSocket Updates** – Automatically updates the graph as new ROS2 messages arrive.  
3. **Node Differentiation** –  
   - **Hardware nodes** are **rectangles**, while others are **circles**.  
   - **State interface nodes** are **green**, while others are black.  
4. **Edge Types & Colors** –  
   - **Command interface edges** are **red**.  
   - **State interface edges** are **blue**.  
5. **Interactive Graph** – Drag nodes, zoom, and pan for better visualization.  
6. **Node Metadata** – Click a node to view **metadata** in an alert popup.  

---

## **Tech Stack**  
- **Frontend:** TypeScript, D3.js  
- **Backend:** Node.js, TypeScript (WebSocket server for ROS2)  
- **Data Format:** JSON messages over WebSocket  

---

## **Setup & Installation**  

### **1. Clone the Repository**  
```bash
git clone https://github.com/Vai-Man/ros2-dag-visualizer.git
cd ros2-dag-visualizer
```

### **2. Install Dependencies**  

#### **Backend**  
```bash
cd backend
npm install
```

#### **Frontend**  
```bash
cd frontend
npm install
```

### **3. Run the Application**  

#### **Start Backend (WebSocket Server)**
```bash
cd backend
node index.js
```

#### **Start Frontend (HTML Server)**

```bash
cd frontend
npm start
```

---

## **Usage**  

1. Open the frontend in the browser (`http://localhost:5500/` if using Live Server).  
2. The graph updates **automatically** as **WebSocket messages** arrive from ROS2.  
3. **Click on a node** to view **metadata**.  
4. **Use checkboxes** to **filter elements** like hardware nodes, command edges, etc.  

---

## **WebSocket Data Format**  

The backend listens to ROS2 messages and sends them to the frontend in this JSON format:

### **Graph Update Message**
```json
{
  "start": "A",
  "end": "C",
  "command_interface": true,
  "state_interface": false,
  "is_hardware": true,
  "metadata": "Hardware node example"
}
```

### **Explanation of Fields:**
- **`start` / `end`** – Nodes in the graph  
- **`command_interface`** – If true, edge is **red**  
- **`state_interface`** – If true, edge is **blue**  
- **`is_hardware`** – If true, the **start node** is drawn as a rectangle  
- **`metadata`** – Additional information (displayed on node click)  

---