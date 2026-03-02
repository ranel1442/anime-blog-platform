const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload'); // צינור התמונות ל-Cloudinary
const authMiddleware = require('../middleware/authMiddleware'); // מוודא שהמשתמש מחובר

// POST /api/auth/google
router.post('/google', authController.googleLogin);
// הראוט החדש לעדכון הפרופיל (שים לב ל-authMiddleware ול-upload)
router.put('/update-profile', authMiddleware, upload.single('avatarUrl'), authController.updateProfile);
module.exports = router;