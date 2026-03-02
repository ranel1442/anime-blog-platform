const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // מתחבר למסד נתונים מקומי בשם anime_blog_db
    await mongoose.connect('mongodb://localhost:27017/anime_blog_db');
    console.log('MongoDB is Connected Successfully! 🚀');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;