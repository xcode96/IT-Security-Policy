# IT Security Policy Training Application

This is an interactive, single-page application designed to test and improve knowledge on core IT security policy topics. It provides a user-friendly quiz interface for employees and a comprehensive admin panel for managing users, quiz content, and training reports.

## Key Features

- **Secure User & Admin Logins**: Separate, password-protected access for trainees and administrators.
- **One-Time Assessments**: User accounts are automatically deactivated after training completion to ensure the integrity of the results.
- **Dynamic Quiz System**: Quizzes are loaded from a central `constants.ts` file, making them easy to update.
- **Comprehensive Admin Panel**:
  - **User Management**: Add and delete user accounts.
  - **Question Management**: Add new questions to any quiz category.
  - **Data Workflow**: Import and export the entire question set as a JSON file.
  - **Report Review**: View detailed training reports, including pass/fail status and areas of weakness.
  - **Share Feedback**: Easily copy a formatted report to share with users.
- **Resilient Data Handling**: The application is designed to work with a live API but includes a seamless local storage fallback, ensuring it remains 100% functional even if the server is unavailable.

---

## How to Deploy to a Live Server (GitHub Pages)

You can host this application for free using GitHub Pages.

### Step 1: Create a GitHub Repository

1.  Create a new repository on your GitHub account.
2.  Upload all the project files (`index.html`, `App.tsx`, etc.) to this new repository.

### Step 2: Enable GitHub Pages

1.  In your repository on GitHub, go to the **Settings** tab.
2.  In the left sidebar, click on **Pages**.
3.  Under the "Build and deployment" section, for the **Source**, select **Deploy from a branch**.
4.  For the **Branch**, select `main` (or `master`) and keep the folder as `/ (root)`.
5.  Click **Save**.

GitHub will now build your page and deploy it. It may take a few minutes. Once it's ready, you will see a URL at the top of the Pages settings, like `https://<your-username>.github.io/<your-repository-name>/`. This is your live application URL.

---

## Data Workflow: How to Update the Live Quiz Questions

Because this application is a **static site** (it doesn't have a live database), updating the quiz questions requires a simple code update. The Admin Panel is a powerful tool to help you with this.

**The process is designed to be safe and easy:**

1.  **Test Locally or on a Staging Site**: Access the **Admin Panel** of your application (by adding `?page=admin` to the URL).

2.  **Add Your New Questions**: Go to the **Question Management** tab and use the form to add all the new questions you need for each category.

3.  **Export the Updated Data**: Once you've added all your questions, click the **Export to JSON** button. This will download a file named `quizzes.json`. This file contains all the original questions plus all the new ones you just added.

4.  **Update the Source Code**:
    *   Open the `quizzes.json` file you just downloaded in a text editor.
    *   Copy the entire content of this file.
    *   In your project's source code, open the **`constants.ts`** file.
    *   Delete the entire existing content of the `QUIZZES` array and **paste the new content** you copied from `quizzes.json`.

5.  **Commit and Push Your Changes**: Save the updated `constants.ts` file. Commit this change to your GitHub repository and push it.

    ```bash
    git add constants.ts
    git commit -m "Update quiz questions"
    git push
    ```

6.  **Done!**: GitHub Pages will automatically redeploy your site with the changes. Within a few minutes, the live application will be serving the new, updated set of quiz questions to all users.
