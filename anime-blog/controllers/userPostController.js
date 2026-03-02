const UserPost = require('../models/UserPost');

// 1. יצירת פוסט (מעודכן: המחבר נלקח מהטוקן)
exports.createUserPost = async (req, res) => {
  try {
    // 1. מושכים את הטקסטים שהגיעו (שים לב שכשיש תמונה, נתונים מגיעים כ-FormData)
    const { title, content, tags } = req.body;
    
    // 2. משתנה ריק לתמונה
    let imageUrl = '';

    // 3. הקסם של Multer + Cloudinary: 
    // אם המשתמש העלה קובץ, הקישור לענן יחכה לנו ב- req.file.path!
    if (req.file) {
      imageUrl = req.file.path;
      console.log('📸 תמונה הועלתה בהצלחה לענן! קישור:', imageUrl);
    }

    // 4. יצירת הפוסט במסד הנתונים
    const newPost = new UserPost({ // או CommunityPost, תלוי איך קראת למודל בקובץ הזה
      title,
      content,
      tags: tags ? JSON.parse(tags) : [], // ב-FormData תגיות לרוב מגיעות כמחרוזת שצריך לפרסס
      author: req.user.userId, 
      imageUrl: imageUrl // <-- שומרים את הקישור מהענן!
    });

    await newPost.save();
    
    // --> התיקון כאן: מושכים את הפוסט שיצרנו יחד עם פרטי המשתמש האמיתיים! <--
    const populatedPost = await UserPost.findById(newPost._id).populate('author', 'username avatarUrl');

    res.status(201).json({ message: 'הפוסט נוצר בהצלחה!', post: newPost });

  } catch (error) {
    console.error('❌ שגיאה ביצירת פוסט:', error);
    res.status(500).json({ message: 'שגיאת שרת ביצירת הפוסט' });
  }
};

// 2. קריאת כל הפוסטים של הקהילה (Read All)
exports.getAllUserPosts = async (req, res) => {
  try {
    // משיכת כל הפוסטים מהמסד מהחדש לישן
    const posts = await UserPost.find()
      .populate('author', 'username avatarUrl') // מושך את פרטי יוצר הפוסט
      .populate('comments.user', 'username avatarUrl') // <-- השורה החדשה: מושכת את פרטי מגיב התגובה
      .populate('comments.replies.user', 'username avatarUrl') // <-- השורה החדשה: מושכת את פרטי מגיב ה-Reply
      .sort({ createdAt: -1 }); // מסדר לפי תאריך יצירה (החדש למעלה)

    res.status(200).json(posts);
  } catch (error) {
    console.error('❌ שגיאה בשליפת פוסטים:', error);
    res.status(500).json({ message: 'שגיאת שרת בשליפת הפוסטים' });
  }
};

// 3. קריאת פוסט ספציפי (Read One)
exports.getUserPostById = async (req, res) => {
  try {
    const post = await UserPost.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הפוסט', error: error.message });
  }
};

// 4. עדכון פוסט (מעודכן: בדיקת הרשאות מול הטוקן)
exports.updateUserPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const post = await UserPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    // האם המשתמש המחובר הוא כותב הפוסט או אדמין?
    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין לך הרשאה לערוך פוסט זה' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.updatedAt = Date.now();

    const updatedPost = await post.save();
    res.status(200).json({ message: 'הפוסט עודכן בהצלחה', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בעדכון הפוסט', error: error.message });
  }
};

// 5. מחיקת פוסט (מעודכן: בדיקת הרשאות מול הטוקן)
exports.deleteUserPost = async (req, res) => {
  try {
    const post = await UserPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק פוסט זה' });
    }

    await UserPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'הפוסט נמחק בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת הפוסט', error: error.message });
  }
};


// פונקציה להוספה/הסרה של לייק מפוסט קהילה
exports.toggleLikeUserPost = async (req, res) => {
  try {
    const post = await UserPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    const userId = req.user.userId;
    const index = post.likes.indexOf(userId);
    
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    const updatedPost = await post.save();
    res.status(200).json({ 
      message: index === -1 ? 'לייק נוסף בהצלחה' : 'לייק הוסר', 
      likesCount: updatedPost.likes.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בפעולת הלייק', error: error.message });
  }
};





// ==========================================
// 💬 מערכת תגובות (Comments & Replies)
// ==========================================

// 1. פונקציה להוספת תגובה ראשית לפוסט
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    const post = await UserPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    // יצירת אובייקט התגובה
    const newComment = {
      user: req.user.userId, // נלקח מהטוקן של המשתמש המחובר
      content: content
    };

    // דחיפת התגובה למערך התגובות של הפוסט
    post.comments.push(newComment);
    await post.save();

    // קסם! אנחנו מושכים את הפוסט מחדש, והפעם אומרים למונגו לאכלס (populate)
    // גם את יוצר הפוסט, גם את מגיבי התגובות, וגם את מגיבי ה-replies!
    const updatedPost = await UserPost.findById(postId)
      .populate('author', 'username avatarUrl')
      .populate('comments.user', 'username avatarUrl')
      .populate('comments.replies.user', 'username avatarUrl');

    res.status(201).json({ message: 'התגובה פורסמה!', post: updatedPost });

  } catch (error) {
    console.error('❌ שגיאה בהוספת תגובה:', error);
    res.status(500).json({ message: 'שגיאת שרת בהוספת התגובה' });
  }
};

// 2. פונקציה להוספת תגובה לתגובה (Reply)
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId, commentId } = req.params;

    const post = await UserPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    // Mongoose נותן לנו פונקציה חכמה למצוא תת-אובייקט בתוך מערך לפי ID
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'התגובה המקורית לא נמצאה' });

    const newReply = {
      user: req.user.userId,
      content: content
    };

    // דוחפים את ה-reply לתוך המערך הפנימי של התגובה הספציפית
    comment.replies.push(newReply);
    await post.save();

    // שוב, שולחים לפרונטאנד את הפוסט המלא והמעודכן כדי שה-UI יתרענן אוטומטית
    const updatedPost = await UserPost.findById(postId)
      .populate('author', 'username avatarUrl')
      .populate('comments.user', 'username avatarUrl')
      .populate('comments.replies.user', 'username avatarUrl');

    res.status(201).json({ message: 'התגובה פורסמה!', post: updatedPost });

  } catch (error) {
    console.error('❌ שגיאה בהוספת תגובה לתגובה:', error);
    res.status(500).json({ message: 'שגיאת שרת בהוספת התגובה' });
  }
};


// ==========================================
// 🗑️ מערכת מחיקת תגובות
// ==========================================

// 1. פונקציה למחיקת תגובה ראשית
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await UserPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    // מציאת התגובה הספציפית בתוך הפוסט
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'התגובה לא נמצאה' });

    // אבטחה: מוודאים שמי שמנסה למחוק הוא כותב התגובה, *או* שהוא אדמין!
    // (הערה: אם הגדרת אדמין בדרך אחרת כמו req.user.isAdmin, שנה את התנאי בהתאם)
    const isAuthor = comment.user.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin'; 

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק תגובה זו' });
    }

    // מחיקת התגובה מהמערך
    post.comments.pull(commentId);
    await post.save();

    // שולחים חזרה את הפוסט המעודכן (בלי התגובה) כדי שהפרונטאנד יתרענן
    const updatedPost = await UserPost.findById(postId)
      .populate('author', 'username avatarUrl')
      .populate('comments.user', 'username avatarUrl')
      .populate('comments.replies.user', 'username avatarUrl');

    res.status(200).json({ message: 'התגובה נמחקה בהצלחה', post: updatedPost });

  } catch (error) {
    console.error('❌ שגיאה במחיקת תגובה:', error);
    res.status(500).json({ message: 'שגיאת שרת במחיקת התגובה' });
  }
};

// 2. פונקציה למחיקת תגובה לתגובה (Reply)
exports.deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const post = await UserPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'התגובה המקורית לא נמצאה' });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: 'תגובת ההמשך לא נמצאה' });

    // אבטחה: מוודאים שמי שמנסה למחוק הוא כותב התגובה, *או* שהוא אדמין!
    // (הערה: אם הגדרת אדמין בדרך אחרת כמו req.user.isAdmin, שנה את התנאי בהתאם)
    const isAuthor = comment.user.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin'; 
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק תגובה זו' });
    }

    // מחיקת ה-Reply
    comment.replies.pull(replyId);
    await post.save();

    const updatedPost = await UserPost.findById(postId)
      .populate('author', 'username avatarUrl')
      .populate('comments.user', 'username avatarUrl')
      .populate('comments.replies.user', 'username avatarUrl');

    res.status(200).json({ message: 'התגובה נמחקה בהצלחה', post: updatedPost });

  } catch (error) {
    console.error('❌ שגיאה במחיקת תגובת המשך:', error);
    res.status(500).json({ message: 'שגיאת שרת במחיקת התגובה' });
  }
};