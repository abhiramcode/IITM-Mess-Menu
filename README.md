<p align="center">
  <img src="./public/logo.svg" alt="IITM Mess Menu Logo" width="120">
</p>

<h1 align="center">IITM Mess Menu Viewer</h1>

<p align="center">
  A simple, fast, and beautiful way for <b>IIT Madras</b> students to check their mess menu.
  <br />
  No more searching for confusing PDFs!
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

---

## 🎯 What is this?

This project is a user-friendly web application designed to help students at **IIT Madras** easily view their daily and weekly mess menus. It takes all the different mess schedules and presents them in a clean, interactive, and always up-to-date interface.

Simply open the app, and you'll instantly know what's for breakfast, lunch, snacks, and dinner.

## ✨ Key Features

This app is packed with features designed for a seamless and intelligent user experience.

### Smart & Personalized
*   **🧠 Intelligent "Today" View:** Automatically highlights the current or next upcoming meal and smoothly scrolls it into view on load. Past meals are visually de-emphasized.
*   **🔄 Cycle-Aware Preferences:** Set a different mess preference for each menu cycle. The app intelligently remembers your choice for the monsoon semester, winter break, and more.
*   **🚀 Proactive Onboarding:** When a new mess cycle begins, the app automatically prompts you to set your preference, ensuring a seamless transition.
*   **🎨 Light & Dark Modes:** A sleek interface that looks great day or night, with a manual toggle and respect for your system's theme.

### Powerful Tools
*   **📅 Historical Calendar:** Use the beautiful, themed calendar to view the menu for any past or future date within the available cycles.
*   **Full Week Explorer:** Toggle between the standard single-day view and a compact "Full Week" view to see the entire week's menu at a glance.
*   **🎉 Dynamic Event Menus:** The app automatically displays special, temporary menu changes for festivals and events, complete with a notification banner.
*   **⚙️ Advanced Settings:** Manage your preferences for previous, current, and next cycles, see a privacy notice, and reset the app if needed.

### Performance & Reliability
*   **⚡ Blazing Fast Performance:** Built with a "Static Shell" architecture. Skeletons prevent layout shift, and an anti-flash script ensures a smooth dark mode loading experience.
*   **📶 Full Offline Support:** As a Progressive Web App (PWA), the entire app and its menu data are cached, making it fully functional without an internet connection.
*   **⬆️ Instant App Updates:** A toast notification appears right in the app when a new version is deployed, allowing you to reload and get the latest features immediately.

---

## 💻 Technologies Used

This app was built using a modern frontend stack to ensure it's fast, reliable, and easy to use.

*   **React** (with Vite)
*   **Tailwind CSS v4**
*   **Lucide React** (Icons)
*   **MUI X Date Pickers** (Calendar)
*   **React Loading Skeleton** (Performance)
*   **Vite PWA Plugin**

---

## 🤝 How to Contribute

Contributions are what make the open-source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

### Suggesting Changes or Reporting Bugs

Got an idea to make this even better? Found a mistake in a menu or a bug in the
app? The best way to help is to
**[open an issue](https://github.com/peddintisonu/IITM-Mess-Menu/issues)**. Be
as descriptive as possible!

### Making Code Contributions

If you'd like to contribute code, here’s how you can get started:

1.  **Fork the Project**

    - Click the `Fork` button at the top-right of this page to create a copy of
      this repository in your own GitHub account.

2.  **Clone Your Fork**

    - Get a copy of the code onto your local machine.

    ```sh
    git clone https://github.com/peddintisonu/IITM-Mess-Menu.git
    ```

3.  **Install Dependencies**

    - Navigate into the project folder and install the necessary packages.

    ```sh
    cd IITM-Mess-Menu
    npm install
    ```

4.  **Create a New Branch**

    - It's important to create a new branch for your changes to keep things
      organized.

    ```sh
    git checkout -b feature/YourAmazingFeature
    ```

5.  **Make Your Changes**

    - Start the development server to see your changes live as you code.

    ```sh
    npm run dev
    ```

    - Now, you can edit the code, fix bugs, or add your new feature!

6.  **Commit and Push Your Changes**

    - Once you're happy with your changes, commit them with a clear message and
      push them to your fork.

    ```sh
    git add .
    git commit -m "feat: Add some amazing feature"
    git push origin feature/YourAmazingFeature
    ```

7.  **Open a Pull Request**
    - Go to your forked repository on GitHub. You'll see a prompt to create a
      `Pull Request`. Click it, describe your changes, and submit it for review.

Thank you for helping make this tool better for everyone!
