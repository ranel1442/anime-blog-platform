const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  // console.log("\n================================================");
  // console.log("🌟 בקשת התחברות גוגל הגיעה לשרת ה-Backend! 🌟");
  // console.log("================================================");

  try {
    const { credential } = req.body; 
    // console.log("1. בדיקת טוקן מגוגל:", credential ? "✅ התקבל" : "❌ חסר!");

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    // console.log("2. האימות מול השרתים של גוגל: ✅ עבר בהצלחה!");
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    // console.log(`3. פרטי משתמש: שם - ${name}, אימייל - ${email}`);

    let user = await User.findOne({ email });

    if (!user) {
      // console.log("4. משתמש חדש! יוצר חשבון במסד הנתונים...");
      user = new User({
        username: name,
        email: email,
        googleId: googleId,
        avatarUrl: picture,
      });
      await user.save();
    } else {
      console.log("4. המשתמש מוכר, מתחבר לחשבון קיים...");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' } 
    );
    // console.log("5. טוקן התחברות (JWT) נוצר: ✅");

    // console.log("🚀 תהליך הסתיים בהצלחה! שולח אישור לפרונטאנד.\n");
    res.status(200).json({
      message: 'התחברות בוצעה בהצלחה',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
    });

  } catch (error) {
    console.log("\n❌❌❌ שגיאה קריטית בטרמינל השרת ❌❌❌");
    console.error(error.message);
    console.log("----------------------------------------\n");
    res.status(401).json({ message: 'אימות גוגל נכשל', error: error.message });
  }
};



// ==========================================
// ⚙️ עדכון פרופיל משתמש (תמונה ושם)
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    let updateData = {};

    // אם המשתמש הקליד שם חדש
    if (username) {
      updateData.username = username;
    }

    // הקסם של Multer + Cloudinary:
    // שים לב שכאן אנחנו מעדכנים את השדה avatarUrl בדיוק כמו שהוא מוגדר אצלך מול גוגל!
    if (req.file) {
      updateData.avatarUrl = req.file.path;
      console.log('📸 תמונת פרופיל חדשה הועלתה לענן! קישור:', updateData.avatarUrl);
    }

    // מעדכנים את המשתמש במסד הנתונים לפי ה-ID מהטוקן
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, 
      updateData,
      { returnDocument: 'after' } // מבקשים ממונגו להחזיר את המשתמש *אחרי* העדכון
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    // שולחים את המשתמש חזרה לפרונטאנד בדיוק באותו מבנה כמו בהתחברות של גוגל
    res.status(200).json({ 
      message: 'הפרופיל עודכן בהצלחה!', 
      user: { 
        id: updatedUser._id, 
        username: updatedUser.username, 
        email: updatedUser.email, 
        role: updatedUser.role, 
        avatarUrl: updatedUser.avatarUrl 
      } 
    });

  } catch (error) {
    console.error('❌ שגיאה בעדכון הפרופיל:', error);
    res.status(500).json({ message: 'שגיאת שרת בעדכון הפרופיל' });
  }
};