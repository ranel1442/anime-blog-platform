const mongoose = require('mongoose');

// סכמה עבור תגובה לתגובה (Reply)
const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// סכמה עבור תגובה ראשית (Comment)
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  replies: [replySchema], // מערך פנימי של תגובות לתגובה הזו (Nested)
  createdAt: { type: Date, default: Date.now }
});

// המודל הראשי של הפוסט בקהילה
const userPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tags: [{ type: String }],
  imageUrl: { type: String, default: '' }, // <-- השדה החדש לתמונה שהמשתמש יעלה מהטלפון/מחשב!
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema], // <-- השדה החדש שמחזיק את כל מערכת התגובות
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserPost', userPostSchema);