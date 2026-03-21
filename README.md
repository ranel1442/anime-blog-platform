# 🎌 AnimeBlog - AI-Powered Auto-Pilot Anime Community

An innovative, full-stack platform for anime enthusiasts. It goes far beyond a standard blog by operating as a **fully automated, AI-driven content machine**. From scraping breaking news to generating viral-ready Instagram Reels, the platform runs on auto-pilot while also hosting a vibrant, interactive community.

## ✨ Key Features

### 🤖 100% Automated Content Pipeline
* **Autonomous AI News Agents**: Background agents continuously scrape top anime news sources, summarize the information, and autonomously write and format comprehensive Hebrew articles.
* **Creative AI Metadata**: The AI automatically generates click-worthy titles, relevant tags, and highly detailed prompts for AI-generated article thumbnails—all without human intervention.

### 📱 Zero-Click Instagram Reels Generation
A complete, automated pipeline that converts any article into a highly engaging, fully produced short video for social media (Instagram Reels / TikTok).
* **Smart Scripting & Copywriting**: **Google Gemini** acts as a social media manager, summarizing the article into a punchy 60-second video script AND generating the exact caption, call-to-action, and hashtags for the Instagram post description.
* **Text-to-Speech (TTS)**: Converts the AI script into professional, energetic audio using **Azure TTS**.
* **Lip-Sync & Animation**: Animates a virtual presenter (Maya) using **SadTalker & GFPGAN** (powered by **Replicate**'s GPU servers) to match the audio perfectly.
* **Presenter Management**: Admins can upload new presenter avatars, select them via a dropdown, and preview them in a live modal.
* **Smart File Management**: Automatically downloads generated MP4/MP3 files from the cloud, links them to the database, and safely cleans up local `temp_reels` storage to optimize server resources.

### 🛡️ Advanced Admin Panel
* Full control over the AI's output. Admins can review, approve, or reject AI-generated posts.
* Edit content, manage tags, feature specific posts on the homepage carousel, and manually trigger AI agents when breaking news hits.

### 👥 Interactive Community & Modern UI
* **Community Forum**: A dedicated space where users can create posts, comment, and reply. Includes full CRUD capabilities with strict permission checks.
* **Modern UI/UX**: Fully responsive Dark Mode design built with **Tailwind CSS** and **Lucide React** icons, providing a sleek, intuitive user experience.
* **Secure Authentication**: Seamless Google OAuth integration using JWT for secure session management.
* **Cloud & Local Storage**: Real-time profile picture and cover image uploads powered by **Cloudinary**, alongside secure local storage solutions (`multer`, `fs`, `path`) for temporary video rendering.

## 🛠️ Technology Stack

**Frontend:**
* Next.js (v16.1.6 with Turbopack)
* React (State management, interactive Modals)
* Tailwind CSS
* Axios (Secure JWT requests)
* @react-oauth/google (Authentication)
* Lucide React (Vector Icons)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose (Database)
* **AI & Machine Learning**: Replicate API (SadTalker), Google Gemini AI, Azure TTS
* JsonWebToken (JWT) & Google Auth Library
* Multer & Cloudinary (Image Processing & Storage)
* File System (`fs`, `path`) for local video processing
* Node-Cron (Automated Agent Scheduling)

## 🚀 Getting Started

### Prerequisites
* Node.js installed
* MongoDB connection string
* Cloudinary account details
* Google OAuth Client ID
* Replicate API Token
* Azure TTS API Keys
* Google Gemini API Key

### Installation
1. Clone the repository.
2. Run `npm install` in both the `frontend` and `backend` directories.
3. Create a `.env` file in both directories with your specific environment variables.
4. Start the backend: `npm run dev` (or `node server.js`).
5. Start the frontend: `npm run dev`.

## 📜 Legal & Compliance
The platform includes built-in "Notice and Takedown" procedures, clear privacy disclaimers regarding OAuth data collection, and explicitly marks AI-generated content to maintain transparency and legal compliance.