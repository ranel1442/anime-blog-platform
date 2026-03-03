const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // השרת ינסה לקחת את הקישור לענן ממשתני הסביבה, ואם הוא לא קיים (כמו בפיתוח על המחשב שלך), הוא ישתמש בקישור הלוקאלי
    const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/anime_blog_db';
    
    await mongoose.connect(dbURI);
    console.log('MongoDB is Connected Successfully! 🚀');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;