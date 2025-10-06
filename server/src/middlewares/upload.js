const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const mediaDir = path.join(uploadsDir, 'media');

[uploadsDir, avatarsDir, mediaDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}${ext}`);
  },
});

// Storage configuration for media
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `media-${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

const mediaFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Multer instances
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
}).single('avatar');

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: mediaFilter,
}).array('media', 10); // Max 10 files

module.exports = {
  uploadAvatar,
  uploadMedia,
};