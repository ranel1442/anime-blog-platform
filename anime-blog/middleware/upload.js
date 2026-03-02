const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. חיבור לחשבון ה-Cloudinary שלך בעזרת המפתחות מה-.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. הגדרת מנוע האחסון (איפה ואיך לשמור את הקבצים בענן)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'anime_community_posts', // שם התיקייה שתיווצר לך בענן באופן אוטומטי
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'], // חוסם קבצים שאינם תמונות
    transformation: [{ width: 1200, crop: 'limit' }] // מקטין תמונות ענקיות כדי שהאתר יטען מהר!
  }
});

// 3. ייצוא הפונקציה שבה נשתמש בראוטר שלנו
const upload = multer({ storage: storage });

module.exports = upload;