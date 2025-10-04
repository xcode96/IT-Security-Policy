# IT Security Policy Training Application

This is an interactive, full-stack application designed to test and improve knowledge on core IT security topics. It consists of two main parts:

1.  **Frontend**: A user-friendly React application for employees to take quizzes and for administrators to manage the system.
2.  **Backend**: A simple Node.js/Express API server to receive, store, and manage training reports.

---

## Project Setup & Deployment Guide

Follow these steps to get both the backend API and the frontend application live.

### Part 1: Backend API Setup & Deployment

The backend server is responsible for storing user reports. You need to deploy this first to get a live URL.

#### A. How to Run the API Locally (for testing)

1.  **Prerequisites**: Make sure you have [Node.js](https://nodejs.org/) installed on your computer.
2.  **Install Dependencies**: In your project folder (where `package.json` and `server.js` are), open a terminal and run:
    ```bash
    npm install
    ```
3.  **Start the Server**: After installation, run:
    ```bash
    npm start
    ```
4.  Your API is now running at `http://localhost:3001`.

> **Note**: This server uses in-memory storage, which means all data will be lost when the server restarts. For a production-grade solution, you would connect this to a database like PostgreSQL or MongoDB.

#### B. How to Deploy the API to a Live Server (Recommended: Render)

We'll use a free service called [Render](https://render.com) to host the API.

1.  **Create a GitHub Repository for the API**:
    - Create a **new, separate** repository on your GitHub account (e.g., `it-security-api`).
    - Upload **only** the `server.js` and `package.json` files to this new repository.

2.  **Deploy on Render**:
    - Sign up for a free account at [render.com](https://render.com).
    - On your dashboard, click **New +** and select **Web Service**.
    - Connect your GitHub account and select the API repository you just created.
    - Give your service a unique name. Render will automatically detect it's a Node.js app and fill in the settings:
      - **Build Command**: `npm install`
      - **Start Command**: `npm start`
    - Scroll down and click **Create Web Service**.
    - Render will build and deploy your API. After a minute or two, you will get a live URL at the top of the page (e.g., `https://your-api-name.onrender.com`). **Copy this URL.**

3.  **Configure Environment Variables (CRUCIAL STEP)**:
    - After the first deployment, go to the **Environment** tab for your new web service in Render.
    - Under "Environment Variables", click **Add Environment Variable**.
    - Create a new variable with the following details:
      - **Key**: `CORS_ORIGIN`
      - **Value**: `https://your-frontend-site.vercel.app` (Replace this with the actual URL of your deployed frontend application from Vercel).
    - Click **Save Changes**. Render will automatically redeploy your API with this new setting. This step is essential for security and allows your frontend to communicate with your backend.

---

### Part 2: Frontend Setup & Deployment

Now that you have a live API URL, you can configure and deploy the frontend.

#### A. Connecting the Frontend to Your Live API

1.  **Locate the API Configuration File**:
    Open the `apiConfig.ts` file in your code editor.

2.  **Update the `API_BASE_URL` Constant**:
    In that file, find the line that defines `API_BASE_URL`:
    ```javascript
    const API_BASE_URL = 'https://it-security-policy.onrender.com';
    ```

3.  **Replace the URL**:
    Change the placeholder URL to your own live backend URL from Render. For example:
    ```javascript
    const API_BASE_URL = 'https://your-api-name.onrender.com';
    ```

4.  **Save the file**. Your frontend is now configured to communicate with your live backend.

#### B. How to Deploy the Frontend to a Live Server

1.  **Create a GitHub Repository for the Frontend**:
    - Create another **new, separate** repository on GitHub (e.g., `it-security-frontend`).
    - Upload all the frontend files and folders (`index.html`, `App.tsx`, `components/`, etc.) to this repository.

2.  **Deploy on Vercel (Recommended)**:
    - Sign up for a free account at [vercel.com](https://vercel.com).
    - Connect your GitHub account and import the frontend repository.
    - Vercel will automatically detect it's a static site and deploy it. **No configuration is needed.**
    - You will be given a live URL for your training application.

---

### Part 3: Workflow for Updating Quiz Questions

To update the quiz questions for all users, you must update the source code. The Admin Panel helps you generate the new code easily.

1.  **Access the Admin Panel**:
    - Go to your live application URL and add `?page=admin` at the end.
    - Example: `https://your-site.vercel.app/?page=admin`
    - Log in with your admin credentials (default Super Admin is `superadmin` / `dq.adm`).

2.  **Add New Questions**:
    - Go to the **Question Management** tab and use the form to add your new questions.

3.  **Export the Updated Data**:
    - Click the **Export to JSON** button to download a `quizzes.json` file.

4.  **Update the Source Code**:
    - Open the downloaded `quizzes.json` file and copy its entire content.
    - In your local frontend project, open the **`constants.ts`** file.
    - Delete everything inside the `export const QUIZZES: Quiz[] = [...]` array and paste the new content.

5.  **Commit and Push**:
    - Save the `constants.ts` file.
    - Commit and push this change to your frontend GitHub repository. Vercel will automatically re-deploy your site with the updated questions.