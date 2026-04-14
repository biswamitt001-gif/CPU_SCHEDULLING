# Render Deployment Guide - SchedSim

This guide provides step-by-step instructions for deploying the CPU Scheduling Simulator to Render.

## Prerequisites
1. A [Render](https://render.com) account.
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (for the free Database).
3. Your code pushed to a GitHub or GitLab repository.

---

## Step 1: Set up MongoDB Atlas
1. Create a free cluster on MongoDB Atlas.
2. Go to **Network Access** and allow access from `0.0.0.0/0` (or get Render's IP addresses if you want to be more secure).
3. Go to **Database Access** and create a user.
4. Get your **Connection String** (URI). It should look like:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/cpu-scheduler?retryWrites=true&w=majority`

---

## Step 2: Deploy to Render using Blueprint
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect the `render.yaml` file and show the services to be created.
5. You will be prompted to enter values for environment variables:
   - **`MONGO_URI`**: Paste your MongoDB connection string from Step 1.
   - **`JAVA_ENGINE_URL`**: This will be automatically linked to the `schedsim-engine` service, but you might need to append `https://` and `/compute`.
     - *Format*: `https://schedsim-engine.onrender.com/compute`

---

## Step 3: Configure Environment Variables Manually (If needed)
If you prefer not to use the Blueprint or if you need to adjust settings later:

### 1. SchedSim Engine (Java)
- **Service Type**: Web Service
- **Root Directory**: `Backend/java-engine`
- **Build Command**: `./mvnw clean install -DskipTests`
- **Start Command**: `java -jar target/*.jar`
- **Port**: `8080` (Render will map this to port 80/443)

### 2. SchedSim API (Node.js)
- **Service Type**: Web Service
- **Root Directory**: `Backend/node-server`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Variables**:
  - `MONGO_URI`: (Your Atlas URI)
  - `JAVA_ENGINE_URL`: `https://schedsim-engine.onrender.com/compute`

### 3. SchedSim Frontend (React)
- **Service Type**: Static Site
- **Root Directory**: `Frontend/client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Variables**:
  - `VITE_API_URL`: `https://schedsim-api.onrender.com/api`

---

## Important Notes
- **Free Tier Sleep**: Render's free tier services "sleep" after 15 minutes of inactivity. The first request after a sleep period may take 30-60 seconds to respond.
- **Java Deployment**: If the Java build fails due to memory, you might need to upgrade to a starter plan (or use a smaller jar if possible). However, for this simulator, the free tier should be sufficient.
- **Live PC Scan**: To use the Live PC Scan feature, the local scanner agent needs to know the URL of your deployed API. You will need to edit the `.ps1` or `.bat` file to point to your Render URL.
