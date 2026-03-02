const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/authMiddleware');

// קריאת תגובות (פתוח לכולם)
router.get('/post/:postId', commentController.getCommentsByPost);

// פעולות שדורשות התחברות
router.post('/', auth, commentController.addComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;