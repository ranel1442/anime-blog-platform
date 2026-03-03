const axios = require('axios');
const cron = require('node-cron');
const { scrapeLatestAnimeNews } = require('./scraperAgent');
const { translateAndEditNews } = require('./editorAgent');
const { enhancePostData } = require('./creativeAgent'); 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runAutomationPipeline() {
  console.log('🚀 מתחיל מחזור אוטומציה חדש...');
  
  const newsItems = await scrapeLatestAnimeNews();

  if (!newsItems || newsItems.length === 0) {
    console.log('🤷‍♂️ לא נמצאו חדשות כרגע (או שהייתה שגיאה בסריקה).');
    return;
  }

  for (const item of newsItems) {
    console.log(`\n⏳ מטפל בכתבה: "${item.title}"`);

    try {
      // 1. תרגום ועריכה 
      const hebrewContent = await translateAndEditNews(item);

      if (hebrewContent) {
        // 2. קריאייטיב (כותרת, תגיות ופרומפט לתמונה)
        const creativeData = await enhancePostData(item.title, hebrewContent);

        // 3. החזרה ל-Pollinations AI!
        console.log(`🎨 מייצר תמונה ב-Pollinations לפי הפרומפט של ה-AI...`);
        const encodedPrompt = encodeURIComponent(creativeData.imagePrompt);
        
        // הוספתי 'seed' רנדומלי כדי שכל תמונה תהיה ייחודית גם אם הפרומפט דומה
        const randomSeed = Math.floor(Math.random() * 100000);
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=400&nologo=true&seed=${randomSeed}`;

        // 4. הרכבת הפוסט הסופי
        const postData = {
          title: creativeData.title,
          content: hebrewContent,
          sourceUrl: item.sourceUrl, // קישור לכתבה המקורית לאדמין
          coverImage: generatedImageUrl, // התמונה מ-Pollinations
          imagePrompt: creativeData.imagePrompt, // <-- השורה החדשה שמעבירה את הפרומפט למסד הנתונים!
          tags: creativeData.tags,
          authorAgent: 'AI News Team 🤖'
        };

        // 5. שמירה במסד הנתונים
        const response = await axios.post('https://anime-blog-platform.onrender.com/api/posts', postData);
        console.log(`✅ הפוסט נשלח לשרת. סטטוס: ${response.data.message || 'נוצר בהצלחה'}`);
      }
    } catch (error) {
      // תופס שגיאות חכמות - בעיקר עצירה אם נגמרה המכסה של ג'מיני!
      if (error.message.includes('429') || (error.response && error.response.status === 429)) {
        console.error(`❌ חרגת ממכסת הבקשות (Quota) של Gemini API. האוטומציה עוצרת כדי לא להקריס את השרת.`);
        break; // יוצא לגמרי מהלולאה ולא מנסה להמשיך לכתבות הבאות
      } else if (error.response && error.response.status === 409) {
        console.log(`⏭️ הכתבה כבר קיימת במערכת, מדלג...`);
      } else {
        console.error(`❌ שגיאה כללית בתהליך הכתבה:`, error.message);
      }
    }
    
    // הגדלתי את ההמתנה ל-10 שניות כדי לעזור עם מגבלות ה-API (Rate Limits)
    console.log('⏳ נושם 10 שניות לפני הכתבה הבאה...\n');
    await sleep(10000); 
  }
  
  console.log('🏁 מחזור האוטומציה הסתיים בהצלחה!');
}

const startAutomations = () => {
  console.log("⏰ מערכת הטיימרים הופעלה (תרוץ כל 2 שעות).");
  cron.schedule('0 */2 * * *', () => {
    runAutomationPipeline();
  });
  
  // להרצה ידנית - שים לב שאולי המכסה היומית שלך בג'מיני הסתיימה להיום!
  //runAutomationPipeline(); 
};

module.exports = { startAutomations, runAutomationPipeline };


