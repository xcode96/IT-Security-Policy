# IT Security Policy Training Application

This is an interactive, single-page application designed to test and improve knowledge on core IT security policy topics. It provides a user-friendly quiz interface for employees and a comprehensive, role-based admin panel for managing users, quiz content, and training reports.

## Key Features

- **Secure User & Admin Logins**: Separate, password-protected access for trainees and administrators.
- **Role-Based Access Control (RBAC)**:
    - **Super Admin**: Full control, including managing other admin accounts.
    - **Editor**: Can manage users, reports, and questions but not other admins.
    - **Viewer**: Read-only access to all data.
- **Formal Assessment Workflow**:
    - Users who fail can request a retake, which must be approved by an admin.
    - Users who pass can request a certificate.
- **Comprehensive Admin Panel**:
  - **Reports Dashboard**: At-a-glance statistics on pass/fail rates.
  - **Report Management**: View, filter, search, and export individual user reports to CSV.
  - **User Management**: Add, delete, search, and export user accounts.
  - **Retake Request Management**: Approve or deny user requests to retake the exam.
  - **Admin Management**: (Super Admin only) Create, delete, and manage other admin accounts.
  - **Certificate Generation**: View and print certificates of completion for users.
- **Dynamic Quiz System**: Quizzes are loaded from a central `constants.ts` file, making them easy to update via a clear workflow.
- **Resilient Data Handling**: The application is designed to post reports to a live API but includes a seamless **local storage fallback**, ensuring it remains 100% functional even if the backend server is unavailable.

---

## 1. Configuration: Connecting to Your API

This application can send training reports to your own backend server. To connect it, you need to update the API endpoint URL in the code.

1.  **Locate the API Endpoints**:
    Open the following files in your code editor:
    - `App.tsx`
    - `components/AdminDashboard.tsx`

2.  **Update the `API_BASE` Constant**:
    In both files, find the line that defines `API_BASE`:
    ```javascript
    const API_BASE = 'https://iso27001-pnrp.onrender.com/api/reports';
    ```

3.  **Replace the URL**:
    Change the placeholder URL to your own live backend endpoint. For example:
    ```javascript
    const API_BASE = 'https://your-company-api.com/api/training-reports';
    ```

4.  **Save the files**. Your application will now send and fetch reports from your specified backend. If the API call fails, it will automatically fall back to using the browser's local storage.

---

## 2. How to Deploy to a Live Server

You can host this application for free using modern static hosting platforms.

### Step 1: Create a GitHub Repository

1.  Create a new repository on your GitHub account.
2.  Upload all the project files (`index.html`, `App.tsx`, etc.) to this new repository.

### Step 2: Deploy

**Option A: Vercel (Recommended)**
1.  Sign up for a free account at [vercel.com](https://vercel.com).
2.  Connect your GitHub account.
3.  Import the repository you just created.
4.  Vercel will automatically detect that it's a static site and deploy it. **No configuration is needed.**
5.  You will be given a live URL (e.g., `https://<project-name>.vercel.app`). Vercel will also automatically re-deploy your site every time you push a change to your GitHub repository.

**Option B: GitHub Pages**
1.  In your repository on GitHub, go to the **Settings** tab.
2.  In the left sidebar, click on **Pages**.
3.  Under the "Build and deployment" section, for the **Source**, select **Deploy from a branch**.
4.  For the **Branch**, select `main` (or `master`) and keep the folder as `/ (root)`.
5.  Click **Save**.
6.  You will get a live URL (e.g., `https://<your-username>.github.io/<your-repository-name>/`). It may take a few minutes for the site to become active.

---

## 3. Workflow: How to Update the Live Quiz Questions

Because this application is a **static site** (it doesn't have a live database), updating the quiz questions for all users requires a simple code update. The Admin Panel is a powerful tool to help you with this.

**Follow this process carefully:**

1.  **Access the Admin Panel**:
    - Go to your live application's URL and add `?page=admin` at the end.
    - Example: `https://your-site.vercel.app/?page=admin`
    - Log in with your admin credentials (default Super Admin is `superadmin` / `dq.adm`).

2.  **Add Your New Questions**:
    - Navigate to the **Question Management** tab.
    - Use the "Add New Question" form to add all the questions you need for each category. The list on the page will update in real-time, but these changes are **only in your browser session** for now.

3.  **Export the Updated Data**:
    - Once you've added all your new questions, click the **Export to JSON** button.
    - This will download a file named `quizzes.json`. This file contains all the original questions plus all the new ones you just added.

4.  **Update the Source Code**:
    - Open the `quizzes.json` file you just downloaded in a text editor (like VS Code, Notepad, etc.).
    - Select all the text and **copy** it.
    - In your local project's source code, open the **`constants.ts`** file.
    - Inside this file, find the `export const QUIZZES: Quiz[] = [...]` array.
    - **Delete everything** inside the square brackets `[...]` and **paste the new content** you copied from `quizzes.json`.

5.  **Commit and Push Your Changes**:
    - Save the updated `constants.ts` file.
    - Commit this change to your GitHub repository and push it. If you're using the command line:
    ```bash
    git add constants.ts
    git commit -m "Update quiz questions"
    git push
    ```

6.  **Done!**: Your hosting provider (Vercel or GitHub Pages) will automatically start a new deployment. Within a few minutes, the live application will be serving the new, updated set of quiz questions to all users.
