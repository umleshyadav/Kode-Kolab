# 🚀 Kode-Kolab — Real-Time Collaborative Coding & Whiteboard Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![CodeMirror](https://img.shields.io/badge/CodeMirror-v6-D83B01?style=flat)](https://codemirror.net/)
[![tldraw](https://img.shields.io/badge/Whiteboard-tldraw-FF7043?style=flat)](https://tldraw.com/)

> **Kode-Kolab** is a full-stack, real-time collaborative development platform that brings developers together into synchronized virtual rooms. Write code simultaneously, run it across 85+ programming languages, brainstorm ideas on an infinite whiteboard, and communicate via integrated real-time chat.

---

## ✨ Features

- **⚡ Real-Time Collaborative Editor**: Multi-user synchronous editing powered by CodeMirror 6 and WebSocket event streaming via Socket.IO, with live remote cursor tooltips and typing indicators.
- **🏃 Multi-Language Code Execution Engine**: Direct containerized execution powered by the Piston API supporting **85+ languages** (C++, Python, JavaScript, Java, Go, Rust, Ruby, etc.) with custom standard input (stdin) and instant output/error streaming.
- **🎨 Infinite Collaborative Whiteboard**: Seamless live sketching and system architecture diagramming powered by `tldraw` with bi-directional synchronization across all peers in the room.
- **💬 Real-Time In-Room Chat**: Integrated instant messaging with timestamps and sender identifiers to keep team communication in context without switching tools.
- **📁 Multi-File Management**: Create, rename, delete, switch between files, and download the entire workspace project as a `.zip` file on the fly.
- **👥 Presence & Room Management**: Unique Room ID generation, instant room link sharing, member status (online/offline tracking), and copy-to-clipboard sharing.
- **🎨 Customization & Themes**: 10+ editor themes (Dracula, GitHub Dark, Sublime, Tokyo Night, Material, etc.), customizable font sizes, and responsive sidebar layouts.

---

## 🛠️ Architecture & Tech Stack

```text
Kode-Kolab/
├── Kode-Kolab-backend/       # Node.js + Express + Socket.IO server
│   ├── server.js             # WebSocket connection management & event broadcasting
│   ├── utils/actions.js      # Centralized action constants
│   ├── package.json
│   └── .env.example
│
├── Kode-Kolab-Frontend/      # React 18 + Vite + TailwindCSS client
│   ├── src/
│   │   ├── components/       # Editor, Sidebar, Chats, Drawing, FileSystem, Forms
│   │   ├── context/          # AppContext, SocketContext, FileContext, ChatContext, RunCodeContext
│   │   ├── hooks/            # Custom hooks for state, responsive design, socket events
│   │   ├── utils/            # Actions, editor languages, themes, status
│   │   └── pages/            # HomePage (room join/create) and EditorPage (main workspace)
│   ├── package.json
│   └── .env.example
└── README.md
```

### Technologies Used

- **Frontend**: React 18, Vite, TailwindCSS, CodeMirror 6 (`@uiw/react-codemirror`), `tldraw`, `react-split`, `react-hot-toast`, `react-icons`, `jszip`, `file-saver`.
- **Backend**: Node.js, Express.js, Socket.IO, CORS, dotenv.
- **Execution Engine**: Piston Execution Engine API (`https://emkc.org/api/v2/piston`).

---

## 🚀 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/Kode-Kolab.git
cd Kode-Kolab
```

### 2. Install Dependencies

You can install all dependencies from the root directory:

```bash
npm run install:all
```

Or install individually:

```bash
# Backend
cd Kode-Kolab-backend
npm install

# Frontend
cd ../Kode-Kolab-Frontend
npm install
```

### 3. Environment Configuration

#### Backend (`Kode-Kolab-backend/.env`):
```env
PORT=3000
```

#### Frontend (`Kode-Kolab-Frontend/.env`):
```env
# Point to your local backend server
VITE_API_BACKEND_URL=http://localhost:3000
```

### 4. Running the Application

In two separate terminals:

**Terminal 1 — Backend:**
```bash
cd Kode-Kolab-backend
npm run dev
# Server runs on http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd Kode-Kolab-Frontend
npm run dev
# Vite runs on http://localhost:5173
```

Now open **`http://localhost:5173`** in your browser, generate a Room ID, enter a username, and start collaborating!

---

## 🔄 Socket.IO Events

| Action Event | Direction | Description |
| :--- | :--- | :--- |
| `join-request` | Client → Server | Client requests to join a room with username & roomId |
| `join-accepted` | Server → Client | Server accepts join and sends existing users list |
| `user-joined` | Server → Broadcast | Notifies existing members that a new user joined |
| `sync-files` | Client ↔ Server | Synchronizes open file structure to newly joined peers |
| `file-updated` | Client → Broadcast | Broadcasts code changes in real-time |
| `typing-start` / `typing-pause` | Client → Broadcast | Live typing activity indicators & remote cursor tooltips |
| `drawing-update` | Client → Broadcast | Bi-directional whiteboard snapshot broadcast |
| `send-message` | Client → Server | Sends room chat messages |
| `receive-message` | Server → Broadcast | Delivers incoming chat messages to room participants |

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
