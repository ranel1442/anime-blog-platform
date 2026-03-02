const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

const { runAutomationPipeline } = require('../agents/orchestrator'); 


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// הגדרות שמירת התמונה: איפה לשמור ואיך לקרוא לה
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../temp_reels')); // שומר בתיקיית הסוכנים
  },
  filename: function (req, file, cb) {
    // נותן שם ייחודי שמתחיל ב-maya_
    cb(null, 'maya_custom_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// נתיבים פתוחים
router.get('/published', postController.getPublishedPosts); // לכולם (עמוד הבית)

// נתיבים לסוכני ה-AI ולניהול
router.post('/', postController.createPost); // הסוכן שולח לכאן

router.get('/presenters', auth, postController.getPresenterImages);
router.post('/upload-presenter', auth, upload.single('image'), postController.uploadPresenterImage);

router.get('/pending', auth, postController.getPendingPosts); // אדמין רואה פוסטים ממתינים
router.post('/:id/like', auth, postController.toggleLike);// נתיב ללייקים (דורש התחברות)
router.get('/:id', postController.getPostById); // נתיב פתוח לקריאת פוסט בודד
router.put('/:id/feature', auth, postController.toggleFeature);


// נתיב לעדכון סטטוס (אישור/דחייה)
router.put('/:id/status', auth, async (req, res, next) => {
  // בדיקה נוספת: האם המשתמש המחובר הוא באמת אדמין?
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'פעולה זו מורשית לאדמינים בלבד' });
  }
  next();
}, postController.updatePostStatus);

// נתיב לעריכת תוכן הפוסט (מותר לאדמינים בלבד)
router.put('/:id', auth, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'פעולה זו מורשית לאדמינים בלבד' });
  }
  next();
}, postController.updatePost);

// =========================================================
// הנתיב החדש שהוספנו: יצירת סרטון רילס (מותר לאדמינים בלבד)
// =========================================================
router.post('/:id/generate-reel', auth, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'פעולה זו מורשית לאדמינים בלבד' });
  }
  next();
}, postController.generateReelForPost);


// ראוט להפעלת סוכני ה-AI באופן ידני (מומלץ לשים פה גם את ה-authMiddleware של האדמין)
router.post('/run-agents', async (req, res) => {
  try {
    // מפעילים את הצינור ברקע בלי לחכות שיסיים
    runAutomationPipeline(); 
    
    // מיד מחזירים תשובה לפרונטאנד שהפקודה התקבלה
    res.status(200).json({ message: 'הסוכנים התעוררו ומתחילים לעבוד ברקע!' });
  } catch (error) {
    console.error('שגיאה בהפעלת הסוכנים:', error);
    res.status(500).json({ message: 'שגיאה בהפעלת הסוכנים' });
  }
});



// ראוט להורדה (מסוג GET כי זה קובץ)
router.get('/:id/download-reel', postController.downloadReelFile);

// ראוט למחיקה (מסוג DELETE, דורש טוקן אבטחה של אדמין)
router.delete('/:id/delete-reel', auth, postController.deleteReelFiles);




module.exports = router;