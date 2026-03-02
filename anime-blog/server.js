require('dotenv').config(); // <-- השורה שקוראת את קובץ ה-.env

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); 
const path = require('path');
// אתחול אפליקציית השרת
const app = express();

// Middlewares
// השורה הזו סופר חשובה! היא מאפשרת לשרת שלנו להבין בקשות שמגיעות בפורמט JSON
// (הסוכנים שלנו ישלחו את הפוסטים בפורמט הזה)
app.use(express.json());

// הפעלת הפונקציה שמתחברת ל-MongoDB
app.use(cors());
app.use(express.json());

connectDB();

// ראוט (נתיב) בדיקה בסיסי כדי לראות שהכל עובד
app.get('/', (req, res) => {
  res.send('Welcome to the Anime Blog API! ⛩️');
});

// הגדרת הפורט (הערוץ) שעליו השרת ירוץ. אם אין משהו מוגדר, ירוץ על 5000
const PORT = process.env.PORT || 5000;

const postRoutes = require('./routes/postRoutes');// ייבוא הראוטים של הפוסטים
const userPostRoutes = require('./routes/userPostRoutes');// ייבוא הראוטים החדשים של פוסטים של משתמשים
const authRoutes = require('./routes/authRoutes');// ייבוא ראוטר ההתחברות
const commentRoutes = require('./routes/commentRoutes');// ייבוא הראוטים של התגובות
const { startAutomations } = require('./agents/orchestrator');// הפעלת האוטומציות של סוכני ה-AI

startAutomations(); // הפעלת הטיימרים של הסוכנים (הם יתחילו לרוץ כל 6 שעות)

app.use('/api/posts', postRoutes);// הגדרת נתיב הבסיס עבור פוסטים
app.use('/api/community-posts', userPostRoutes);// הגדרת נתיב הבסיס עבור פוסטים של הקהילה
app.use('/api/auth', authRoutes);// הגדרת נתיב הבסיס להתחברות
app.use('/api/comments', commentRoutes);// הגדרת נתיב הבסיס לתגובות
app.use('/temp_reels', express.static(path.join(__dirname, 'temp_reels')));// חושף את התיקייה החוצה כדי שהפרונטאנד יוכל להציג את התמונות


// מערכת "לוכד השגיאות" הגלובלית שלנו - חייבת להיות לפני ה-listen!
app.use((err, req, res, next) => {
  console.error("🚨 תפסנו את השגיאה האמיתית:");
  console.dir(err, { depth: null }); // פקודה שמכריחה את JS להדפיס את כל האובייקט ולא [object Object]
  
  // מחזיר גם לפרונטאנד את השגיאה האמיתית
  res.status(500).json({ 
    message: 'שגיאת שרת פנימית', 
    error: err.message || 'שגיאה לא ידועה בענן' 
  });
});


// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT} 🚀`);
});