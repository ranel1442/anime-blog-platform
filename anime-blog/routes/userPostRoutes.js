const express = require('express');
const router = express.Router();
const userPostController = require('../controllers/userPostController');
const auth = require('../middleware/authMiddleware'); // ייבוא שומר הסף
const upload = require('../middleware/upload');

// קריאת פוסטים - פתוח לכולם (אין auth)
router.get('/', userPostController.getAllUserPosts);
router.get('/:id', userPostController.getUserPostById);

// פעולות שדורשות התחברות - הוספנו את ה-auth באמצע!
router.post('/', auth,upload.single('image'), userPostController.createUserPost);
router.put('/:id', auth, userPostController.updateUserPost);
router.delete('/:id', auth, userPostController.deleteUserPost);
router.post('/:postId/comments', auth, userPostController.addComment);// ראוט להוספת תגובה לפוסט
router.post('/:postId/comments/:commentId/replies', auth, userPostController.addReply);// ראוט להוספת תגובה לתוך תגובה קיימת (Reply)
router.delete('/:postId/comments/:commentId', auth, userPostController.deleteComment);// ראוט למחיקת תגובה ראשית
router.delete('/:postId/comments/:commentId/replies/:replyId', auth, userPostController.deleteReply);// ראוט למחיקת תגובה לתגובה (Reply)



// נתיב ללייקים (דורש התחברות)
router.post('/:id/like', auth, userPostController.toggleLikeUserPost);

module.exports = router;