# Jotter - Storage Management System

Jotter is a **storage management system** that allows users to **upload, create, edit, rename, duplicate, delete** files and folders. It supports **notes, images, PDFs** and enforces a **15GB storage limit per user**.

## 🚀 Live Deployment
**Backend API:** [Jotter Backend](https://jotter-backend-production.up.railway.app/)

## ✨ Features
- ✅ **Upload & Manage Files** (Notes, Images, PDFs)
- ✅ **Create & Manage Folders**
- ✅ **Rename, Duplicate, and Delete** files & folders
- ✅ **Move files between folders**
- ✅ **Favorites, Hidden & Locked files**
- ✅ **Track Storage Usage** (Max **15GB per user**)
- ✅ **Get files by creation date**

## 📌 API Endpoints

### **User Authentication**
| Method | Endpoint         | Description          |
|--------|----------------|----------------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login`    | Login & get token   |

### **File & Folder Management**
| Method | Endpoint                | Description                |
|--------|------------------------|----------------------------|
| `POST` | `/folder`              | Create a folder           |
| `POST` | `/note`                | Create a note             |
| `POST` | `/upload`              | Upload a file (image/PDF) |
| `PUT`  | `/rename/:id`          | Rename a file/folder      |
| `POST` | `/duplicate/:id`       | Duplicate a file          |
| `DELETE` | `/delete/:id`        | Delete a file/folder      |
| `GET`  | `/folder/:folderId`    | Get files in a folder     |
| `PUT`  | `/move/:id`            | Move a file to a folder   |
| `GET`  | `/file/:id`            | Get file details          |
| `PUT`  | `/file/favorite/:id`   | Mark file as favorite     |
| `PUT`  | `/file/hide/:id`       | Hide a file               |
| `PUT`  | `/file/lock/:id`       | Lock a file               |
| `GET`  | `/files/recent`        | Get recently uploaded files |

### **Storage Management**
| Method | Endpoint       | Description                  |
|--------|--------------|------------------------------|
| `GET`  | `/storage`   | Get used & remaining storage |

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, MongoDB
- **File Upload:** Multer
- **Authentication:** JWT

## 🚀 Setup & Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/Rufidatul726/jotter-backend.git
   cd jotter-backend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables (`.env` file):**
   ```env
   PORT=5000
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-secret-key
   ```
4. **Run the server:**
   ```sh
   npm start
   ```