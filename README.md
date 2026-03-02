# 🎌 AnimeBlog - AI-Powered Anime Community

An innovative, full-stack platform for anime enthusiasts, featuring community discussions, user profiles, an automated AI-driven news feed, and an integrated AI Reel Generator.

## ✨ Key Features

* **🤖 AI News Agents**: Automated background agents that fetch, summarize, and publish the latest anime news and updates.
* **🎬 AI-Powered Anime Reel Generator**: A complete pipeline inside the Admin Panel to convert articles into short videos (Reels) for social media.
  * **Smart Scripting**: Summarizes articles into punchy short-form scripts using **Google Gemini**.
  * **Text-to-Speech (TTS)**: Converts scripts to high-quality audio using **Azure TTS**.
  * **Lip-Sync & Animation**: Animates a virtual presenter using **SadTalker & GFPGAN** (powered by **Replicate**'s GPU servers) to match the audio perfectly.
  * **Presenter Management**: Upload new presenter avatars, select via dropdown, and preview in a live modal.
  * **Smart File Management**: Downloads generated MP4/MP3 files and safely cleans up local `temp_reels` storage and database records.
* **🛡️ Advanced Admin Panel**: Full control over content. Admins can approve/reject AI posts, edit content, manage tags, feature posts on the carousel, and trigger AI agents manually.
* **👥 Interactive Community**: A dedicated forum where users can create posts, comment, and reply. Includes full CRUD capabilities with permission checks.
* **🔐 Secure Authentication**: Seamless Google OAuth integration using JWT for secure session management.
* **🖼️ Cloud & Local Storage**: Real-time profile picture and post image uploads powered by Cloudinary, plus secure local storage (`multer`, `fs`, `path`) for temporary video rendering.
* **🎨 Modern UI/UX**: Fully responsive Dark Mode design using Tailwind CSS and Lucide React icons.

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