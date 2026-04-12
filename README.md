# SchedSim: Advanced CPU Scheduling Simulator

A modern, high-performance web application for visualizing and comparing CPU scheduling algorithms. Built with a beautifully crafted React glassmorphism UI, a robust Node.js API gateway, and a blazing fast Java Spring Boot core engine.

## 🏗️ Architecture

- **Frontend (`/Frontend/client`)**: React, Vite, Tailwind CSS v3, Recharts, Framer Motion, Lucide-React. Provides an interactive Glassmorphism UI.
- **Node API & DB Layer (`/Backend/node-server`)**: Node.js, Express, Mongoose. Acts as an API Gateway and persists simulation results and metrics to MongoDB.
- **Algorithm Engine (`/Backend/java-engine`)**: Java 17+, Spring Boot. High-speed computation layer responsible for running the scheduling logic.

## ⚙️ Algorithms Supported

1. **First Come First Serve (FCFS)**
2. **Shortest Job First (SJF)** - Non-Preemptive
3. **Shortest Remaining Time First (SRTF)** - Preemptive
4. **Round Robin (RR)** - With customizable Time Quantum
5. **Priority Scheduling** - Non-Preemptive

## 🚀 Running the Project

Ensure you have **Java 17+**, **Maven**, **Node.js (v18+)**, and a running **MongoDB** instance (default `mongodb://localhost:27017/cpu-scheduler`).

### 1. Start the Java Core Engine
```bash
cd Backend/java-engine
mvn spring-boot:run
```
*Runs on http://localhost:8080*

### 2. Start the Node.js API Gateway
```bash
cd Backend/node-server
node index.js
```
*Runs on http://localhost:5000*

### 3. Start the React Frontend
```bash
cd Frontend/client
npm run dev
```
*Runs on http://localhost:5173*

## 🎨 Features
- **Dynamic Gantt Chart:** Animated horizontal Gantt chart built with Framer motion.
- **Performance History:** Saves previous runs to MongoDB and visualizes them on a Recharts bar chart for comparison.
- **Real-time Metrics:** Accurately calculated Turnaround Times and Waiting Times for all algorithms.
