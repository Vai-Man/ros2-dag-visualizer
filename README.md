## **ROS2 DAG Visualizer**  

A TypeScript + React application for visualizing Directed Acyclic Graphs (DAGs) used in ROS2 (Robot Operating System 2). This project provides an interactive interface to view, modify, and analyze DAG structures dynamically, supporting real-time WebSocket updates and node position persistence.

---

## **Features**  
1. **Dynamic Graph Rendering** – Uses **Cytoscape.js** with the **Dagre layout** to visualize ROS2 DAGs.  
2. **Real-time Updates** – Listens to WebSocket events to reflect changes in the DAG dynamically.  
3. **Node Metadata Display** – Click on a node to view its metadata.  
4. **Support for Command & State Edges** – Different edge types with distinct visual styles.  

---

## **Tech Stack**  
- **Frontend:** React, TypeScript, Cytoscape.js, Cytoscape-Dagre  
- **Backend:** Node.js (for WebSocket communication with ROS2)  
- **Data Format:** JSON WebSocket messages  

---

## **Setup & Installation**  

### **1. Clone the Repository**  
```bash
git clone https://github.com/vai-man/ROS2-DAG-Visualizer.git
cd ROS2-DAG-Visualizer
```

### **2. Install Dependencies**  

#### **Backend**  
```bash
cd backend
npm install
```

#### **Frontend**  
```bash
cd ../frontend
npm install
```

### **3. Run the Application**  

#### **Start Backend (WebSocket Server)**
```bash
cd backend
node index.js
```

#### **Start Frontend (React App)**
```bash
cd frontend
npm start
```
---

## **Usage**  

1. Open the frontend in the browser at `http://localhost:3000/`.  
2. The DAG will be updated dynamically based on **WebSocket messages** received from ROS2.  
3. Click on a node to view its **metadata**.  

---

## **WebSocket Data Format**  

The backend receives updates from ROS2 and sends messages to the frontend in the following JSON format:

### **DAG Update Message**
```json
{
  "type": "dag_update",
  "nodes": [
    { "id": "A", "metadata": "Start Node", "disabled": false },
    { "id": "B", "metadata": "Processing Node", "disabled": true }
  ],
  "edges": [
    { "source": "A", "target": "B", "label": "Transition", "type": "command" }
  ]
}
```

### **Log Message**
```json
{
  "type": "log",
  "data": "ROS2 Node started..."
}
```

---

