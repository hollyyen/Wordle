# 🟩 Wordle

A lightweight, minimal 5-letter word game built with **React** and **Firebase**. Guess the hidden word in six tries — a fun and focused take on word puzzles.

## ✨ Features

- 🔠 Guess a 5-letter word in 6 attempts  
- ✅ Input validation against a word list  
- 🔁 Feedback for correct, misplaced, and incorrect letters  
- 🔐 Firebase authentication (Google Sign-In)  
- ☁️ Data persistence with Firestore 

## 🛠️ Tech Stack

- **Frontend**: React + Vite  
- **Backend**: Firebase (Auth, Firestore)  
- **Styling**: CSS  
- **Deployment**: Firebase 

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/hollyyen/Wordle.git
cd Wordle
```
### 2. Install dependencies
```bash
npm install
```
### 3. Create a .env file
In the root folder:
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

### 4. Run locally
```bash
npm run dev
```
### 🌐 Live Demo
[Play it here]([)](https://wordle-d89b8.web.app/)
