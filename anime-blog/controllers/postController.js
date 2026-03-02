const Post = require('../models/Post');

const fs = require('fs');
const path = require('path');

// פונקציה ליצירת פוסט חדש (תשמש את סוכן ה-AI)
exports.createPost = async (req, res) => {
  try {
    // לוקחים את כל המידע שהסוכן שלח בבקשה ושומרים כאובייקט פוסט חדש
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    
    // מחזירים תשובה שהפוסט נוצר בהצלחה
    res.status(201).json({ message: 'הפוסט נשמר בהצלחה וממתין לאישור!', post: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה ביצירת הפוסט', error: error.message });
  }
};

// פונקציה לקבלת כל הפוסטים שממתינים לאישור (תשמש את פאנל האדמין)
exports.getPendingPosts = async (req, res) => {
  try {
    // מושכים מהדאטה-בייס רק את הפוסטים שהסטטוס שלהם הוא pending
    const posts = await Post.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הפוסטים', error: error.message });
  }
};

// פונקציה לאישור או דחייה של פוסט (מיועדת לאדמין בלבד)
exports.updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'published' או 'rejected'
    
    // מוודאים שהסטטוס שנשלח תקין
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'סטטוס לא תקין' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    post.status = status;
    
    // אם הפוסט מאושר, נשמור את תאריך הפרסום
    if (status === 'published') {
      post.publishedAt = Date.now();
    }

    const updatedPost = await post.save();
    res.status(200).json({ message: `הפוסט עודכן לסטטוס: ${status}`, post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בעדכון סטטוס הפוסט', error: error.message });
  }
};

// קבלת כל הפוסטים המאושרים (בשביל עמוד הבית של האתר)
exports.getPublishedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).sort({ publishedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הפוסטים', error: error.message });
  }
};


// פונקציה להוספה/הסרה של לייק מפוסט רשמי
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    const userId = req.user.userId; // מגיע משומר הסף שלנו

    // בודקים אם המשתמש כבר נמצא במערך הלייקים
    const index = post.likes.indexOf(userId);
    
    if (index === -1) {
      // אם הוא לא נמצא, נוסיף אותו (Like)
      post.likes.push(userId);
    } else {
      // אם הוא נמצא, נסיר אותו (Unlike)
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


// קבלת פוסט רשמי בודד לפי ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הפוסט', error: error.message });
  }
};


// פונקציה לעריכת פוסט רשמי (AI) על ידי אדמין
exports.updatePost = async (req, res) => {
  try {
    // הוספנו כאן את ה-tags כדי שהשרת יקבל אותם מהפרונטאנד
    const { title, content, coverImage, tags } = req.body; 
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'הפוסט לא נמצא' });

    // עדכון השדות הרגילים
    post.title = title || post.title;
    post.content = content || post.content;
    post.coverImage = coverImage || post.coverImage;

    // === עדכון התגיות (חכם) ===
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        // אם הפרונטאנד שלח כבר מערך מסודר
        post.tags = tags;
      } else if (typeof tags === 'string') {
        // אם הפרונטאנד שלח טקסט עם פסיקים (למשל: "אנימה, וואן פיס, דרגון בול")
        // נפצל לפי פסיק, ננקה רווחים, ונסנן ריקים
        post.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      }
    }

    const updatedPost = await post.save();
    res.status(200).json({ message: 'הפוסט נשמר ועודכן בהצלחה', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בעדכון הפוסט', error: error.message });
  }
};



// הוספה/הסרה של פוסט מקרוסלת עמוד הבית
exports.toggleFeature = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "הפוסט לא נמצא" });
    }
    
    post.isFeatured = req.body.isFeatured;
    
    // --- התוספת החדשה ---
    // אם הוספנו לקרוסלה -> נשמור את התאריך של עכשיו. אם הסרנו -> נמחק את התאריך.
    if (req.body.isFeatured) {
      post.featuredAt = new Date();
    } else {
      post.featuredAt = null;
    }
    
    await post.save();
    
    res.status(200).json(post);
  } catch (error) {
    console.error("❌ שגיאה בעדכון קרוסלה:", error);
    res.status(500).json({ message: "שגיאה בשרת בעת עדכון הקרוסלה" });
  }
};







// הפונקציה החדשה ליצירת רילס מפוסט קיים
exports.generateReelForPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // 1. מושכים את התמונה שהמשתמש בחר בפאנל
        const selectedImage = req.body.presenterImage || 'maya_base.jpg';

        // 2. קודם כל מייבאים את הפונקציה! (לפני שמשתמשים בה)
        const { createReelFromArticle } = await import('../agents/reelsOrchestrator.js');

        // 3. מכינים את האובייקט של הכתבה
        const articleData = {
            title: post.title,
            content: post.content,
            imageUrl: post.coverImage
        };

        // 4. עכשיו, אחרי שהיא יובאה, מפעילים אותה עם שני הפרמטרים (הכתבה והתמונה)
        const reelResult = await createReelFromArticle(articleData, selectedImage);

        if (reelResult.success) {
            // מעדכנים את מסד הנתונים עם הכתובות של הוידאו והאודיו
            post.reelVideoUrl = reelResult.videoLocalPath;
            post.reelAudioUrl = reelResult.audioLocalPath; // דאגנו לשמור גם את האודיו!
            post.reelCaption = reelResult.caption;
            await post.save();

            return res.json({ message: 'רילס נוצר בהצלחה', post });
        } else {
            return res.status(500).json({ error: reelResult.error });
        }
        
    } catch (error) {
        console.error("שגיאה ב-generateReelForPost:", error);
        return res.status(500).json({ error: 'שגיאת שרת ביצירת הרילס' });
    }
};








// 1. פונקציה להורדת הקבצים
exports.downloadReelFile = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "הפוסט לא נמצא" });

    // מנסים לקחת את האודיו מהמסד. אם זה פוסט ישן (אין כתובת במונגו), מבצעים את החיתוך הנכון
    let audioPath = post.reelAudioUrl;
    if (!audioPath && post.reelVideoUrl) {
        audioPath = post.reelVideoUrl.replace('maya_reel_', 'maya_audio_').replace('.mp4', '.mp3');
    }

    const fileToDownload = req.query.type === 'audio' ? audioPath : post.reelVideoUrl;

    if (!fileToDownload || !fs.existsSync(fileToDownload)) {
        return res.status(404).json({ message: "הקובץ כבר לא קיים בשרת" });
    }

    res.download(fileToDownload); 
  } catch (error) {
    console.error("שגיאה בהורדת הקובץ:", error);
    res.status(500).json({ message: "שגיאת שרת" });
  }
};

// 2. פונקציה למחיקת הקבצים
exports.deleteReelFiles = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "הפוסט לא נמצא" });

    // שוב, שולפים ישירות מהמסד עם רשת ביטחון לפוסטים ישנים
    let audioPath = post.reelAudioUrl;
    if (!audioPath && post.reelVideoUrl) {
        audioPath = post.reelVideoUrl.replace('maya_reel_', 'maya_audio_').replace('.mp4', '.mp3');
    }

    const videoPath = post.reelVideoUrl;

    // מוחקים את הקבצים מהכונן
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    // מנקים את המונגו
    post.reelVideoUrl = null;
    post.reelAudioUrl = null;
    await post.save();

    res.status(200).json({ message: "הקבצים נמחקו מהשרת בהצלחה ופינו מקום!" });
  } catch (error) {
    console.error("שגיאה במחיקת הקבצים:", error);
    res.status(500).json({ message: "שגיאת שרת" });
  }
};

// פונקציה להחזרת רשימת התמונות של הפרזנטורית
exports.getPresenterImages = (req, res) => {
    try {
        // מכוונים לתיקייה הנכונה!
        const dirPath = path.join(__dirname, '../temp_reels');
        
        // מוודאים שהתיקייה קיימת כדי שלא נקבל שגיאת שרת
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        const files = fs.readdirSync(dirPath);
        
        // מסננים רק קבצי תמונה שמתחילים ב-maya_
        const images = files.filter(file => 
            file.startsWith('maya_') && (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
        );
        
        res.status(200).json({ images });
    } catch (error) {
        console.error("שגיאה בשליפת התמונות:", error);
        res.status(500).json({ message: "שגיאה בשליפת התמונות מהשרת" });
    }
};

// פונקציה שמחזירה תשובה שהתמונה הועלתה בהצלחה
exports.uploadPresenterImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "לא הועלתה תמונה" });
    }
    res.status(200).json({ message: "התמונה הועלתה בהצלחה!", filename: req.file.filename });
};