const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. קריאת הטוקן מההאדר של הבקשה (הפרונטאנד ישלח אותו תחת השם 'Authorization')
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'גישה נדחתה. לא סופק טוקן זיהוי.' });
    }

    // 2. ניקוי המחרוזת (בדרך כלל הטוקן נשלח כ- "Bearer <token>")
    const token = authHeader.replace('Bearer ', '');

    // 3. פענוח הטוקן בעזרת המפתח הסודי שלנו מקובץ ה-.env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. הוספת פרטי המשתמש המפוענחים (userId, role) לאובייקט הבקשה
    // כך שהקונטרולר שלנו יוכל להשתמש בהם מיד אחר כך
    req.user = decoded;

    // 5. מעבר לפונקציה הבאה בשרשרת (הקונטרולר)
    next();
  } catch (error) {
    res.status(401).json({ message: 'הטוקן אינו תקין או שפג תוקפו.' });
  }
};