const Comment = require('../models/Comment');
const Post = require('../models/Post');

// 1. הוספת תגובה חדשה
exports.addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    
    const newComment = new Comment({
      postId,
      userId: req.user.userId, // נלקח משומר הסף
      content
    });

    const savedComment = await newComment.save();
    res.status(201).json({ message: 'התגובה נוספה בהצלחה!', comment: savedComment });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בהוספת התגובה', error: error.message });
  }
};

// 2. קבלת כל התגובות לפוסט מסוים
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    // נשלוף את התגובות ונביא גם את שם המשתמש והתמונה שלו
    const comments = await Comment.find({ postId, isApproved: true })
      .populate('userId', 'username avatarUrl')
      .sort({ createdAt: 1 }); // ממוין מהישן לחדש
      
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת התגובות', error: error.message });
  }
};

// 3. מחיקת תגובה (על ידי כותב התגובה או אדמין)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'התגובה לא נמצאה' });

    // בדיקת הרשאות
    if (comment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק תגובה זו' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'התגובה נמחקה בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת התגובה', error: error.message });
  }
};