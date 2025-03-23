const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const User = require("../../models/user");
const FileModel = require("../../models/file");
const authMiddleware = require("../../middlewares/authmiddleware");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../../uploads");
        fs.mkdirsSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const MAX_STORAGE = 15 * 1024 * 1024 * 1024;

const getCategory = (filename) => {
  const lastDotIndex = filename.lastIndexOf('.');
  const ext = filename.slice(lastDotIndex + 1).toLowerCase();
  
  if (["mp4", "mkv", "avi", "mov", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) return "audio";
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["txt", "md", "docx"].includes(ext)) return "note";
  return "other";
};

router.post("/upload", authMiddleware, upload.array("files"), async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
  
    let totalUploadSize = 0;
    const folderMap = {}; // Track created folders
    const uploadedFiles = [];
  
    for (const file of req.files) {
      totalUploadSize += file.size;
  
      // Extract folder name from file path (if exists)
      const relativePath = file.originalname.includes("/") ? file.originalname : null;
      let parentFolderId = null;
  
      if (relativePath) {
        const folderName = relativePath.split("/").slice(0, -1).join("/"); // Extract folder path
        if (!folderMap[folderName]) {
          // Check if folder already exists in DB
          let folder = await FileModel.findOne({ name: folderName, type: "folder", createdBy: req.user.id });
          
          if (!folder) {
            folder = new FileModel({
              name: folderName,
              type: "folder",
              category: getCategory(file.originalname),
              path: folderName,
              createdBy: req.user.id,
            });
            await folder.save();
          }
  
          folderMap[folderName] = folder._id;
        }
        parentFolderId = folderMap[folderName];
      }
  
      // Save file
      const newFile = new FileModel({
        name: file.originalname.split("/").pop(), // Only file name
        type: "file",
        category: getCategory(file.originalname),
        size: file.size,
        path: file.path,
        parentId: parentFolderId, // Attach to folder
        createdBy: req.user.id,
      });
  
      await newFile.save();
      uploadedFiles.push(newFile);
    }
  
    // Update user storage
    user.storageused += totalUploadSize;
    if (user.storageused > MAX_STORAGE) {
      return res.status(400).json({ message: "Storage limit exceeded" });
    }
    
    await user.save();
  
    res.json({ message: "Files uploaded successfully", files: uploadedFiles });
  });
  

  router.get("/files", authMiddleware, async (req, res) => {
    const files = await FileModel.find({ createdBy: req.user.id });
  
    const folderStructure = {};
    files.forEach(file => {
      if (file.parentId) {
        if (!folderStructure[file.parentId]) folderStructure[file.parentId] = [];
        folderStructure[file.parentId].push(file);
      }
    });
  
    res.json({ files, folderStructure });
  });
  
  router.put("/file/favorite/:fileId", authMiddleware, async (req, res) => {
    const file = await FileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });
  
    file.isFavorite = !file.isFavorite; // Toggle favorite
    await file.save();
  
    res.json({ message: "Favorite status updated", file });
  });
  
  router.delete("/file/:fileId", authMiddleware, async (req, res) => {
    const file = await FileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });
  
    await file.remove();
    res.json({ message: "File deleted successfully" });
  });

  router.put("/file/hide/:fileId", authMiddleware, async (req, res) => {
    const file = await FileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });
  
    file.isHidden = !file.isHidden; // Toggle hidden status
    await file.save();
  
    res.json({ message: "File visibility updated", file });
  });


router.put("/file/lock/:fileId", authMiddleware, async (req, res) => {
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: "Password is required" });

  const file = await FileModel.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: "File not found" });

  file.isLocked = true;
  file.password = await bcrypt.hash(password, 10); // Store hashed password
  await file.save();

  res.json({ message: "File locked successfully", file });
});

router.post("/file/unlock/:fileId", authMiddleware, async (req, res) => {
  const { password } = req.body;

  const file = await FileModel.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: "File not found" });

  if (!file.isLocked) return res.json({ message: "File is not locked" });

  const isMatch = await bcrypt.compare(password, file.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

  file.isLocked = false;
  file.password = null;
  await file.save();

  res.json({ message: "File unlocked successfully", file });
});

router.get("/", authMiddleware, async (req, res) => {
  const files = await FileModel.find({ createdBy: req.user.id, isHidden: false });

  // Exclude hidden files & remove locked file paths
  const filteredFiles = files.map(file => ({
    ...file._doc,
    path: file.isLocked ? "Locked File" : file.path, // Hide locked file paths
  }));

  res.json({ files: filteredFiles });
});

router.get("/files/favorites", authMiddleware, async (req, res) => {
  const files = await FileModel.find({ createdBy: req.user.id, isFavorite: true });
  res.json({ files });
});

router.get("files/hidden", authMiddleware, async (req, res) => {
  const files = await FileModel.find({ createdBy: req.user.id, isHidden: true });
  res.json({ files });
});



router.get("/files/by-date", authMiddleware, async (req, res) => {
  try {
    const files = await FileModel.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    const groupedFiles = {};
    files.forEach((file) => {
      const date = moment(file.createdAt).format("YYYY-MM-DD"); // Group by date
      if (!groupedFiles[date]) groupedFiles[date] = [];
      groupedFiles[date].push(file);
    });

    res.json({ filesByDate: groupedFiles });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});




module.exports = router;