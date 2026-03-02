const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // התוכן המלא בעברית
  coverImage: { type: String }, // כתובת התמונה שהסוכן יצר או מצא
  sourceUrl: { type: String }, // לינק לכתבה המקורית שממנה הסוכן שאב את המידע
  status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
  tags: [{ type: String }], // למשל: ["וואן פיס", "פרק 1153", "חדשות אנימה"]
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // <-- השורה החדשה
  authorAgent: { type: String, default: 'AI Publisher Agent' }, // ציון מי כתב את זה
  publishedAt: { type: Date }, // מתי אישרת את הפוסט
  createdAt: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false },
  featuredAt: { type: Date, default: null },
  imagePrompt: { type: String, default: '' }, // <-- הוספנו את השורה הזו! שומרת את הפרומפט של ה-AI
  reelVideoUrl: { type: String, default: null }, // נתיב מקומי או URL לסרטון המוכן
  reelAudioUrl: { type: String, default: null }, // <-- השורה החדשה
  reelCaption: { type: String, default: null },  // הטקסט שנוצר לטיקטוק/אינסטגרם
});

module.exports = mongoose.model('Post', postSchema);