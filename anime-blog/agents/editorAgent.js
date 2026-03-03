const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// משתנה שחי בזיכרון של השרת וזוכר איזה מפתח בתור
let currentKeyIndex = 0;

function getNextApiKey() {
  // קריאת המחרוזת מה-env (שמתי תמיכה גם ביחיד וגם ברבים למקרה ששינית)
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  const keysArray = keysString.split(',');

  // שליפת המפתח הנוכחי וניקוי רווחים
  const selectedKey = keysArray[currentKeyIndex].trim();

  // קידום התור
  currentKeyIndex = (currentKeyIndex + 1) % keysArray.length;

  console.log(`🔑 משתמש במפתח מספר ${currentKeyIndex === 0 ? keysArray.length : currentKeyIndex} מתוך ${keysArray.length}`);
  
  return selectedKey;
}

// פונקציית עזר להשהייה
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateAndEditNews(newsItem, retries = 3) {
  // 1. אנחנו שולפים מפתח חדש *בתוך* הפונקציה, כדי שבכל פוסט הוא יחליף מפתח!
  const currentApiKey = getNextApiKey();
  
  // 2. אתחול ה-API עם הספרייה החדשה והמפתח שנבחר
  const ai = new GoogleGenAI({ apiKey: currentApiKey });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`✍️ סוכן העריכה (ניסיון ${attempt}) עובד על: "${newsItem.title}"...`);
      
      const prompt = `
      אתה בלוגר אנימה מקצועי ונלהב. 
      קיבלת את פיסת החדשות הבאה באנגלית:
      כותרת: ${newsItem.title}
      תקציר: ${newsItem.summary}
      
      המשימה שלך היא לכתוב פוסט לבלוג בעברית, שמסקר את החדשות האלו. 
      הסגנון צריך להיות קליל, מגניב, ומושך קוראים חובבי אנימה.
      אל תכתוב "שלום" או הקדמות, פשוט תכתוב את תוכן הפוסט. 
      תשתמש בפסקאות קצרות, שלב אימוג'ים בטעם, וודא שהשפה טבעית וזורמת.
      `;

      // 3. קריאה נכונה לספרייה החדשה עם מודל שקיים באמת
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          // model: 'gemini-3-flash-preview',
          contents: prompt,
      });

      const hebrewContent = response.text.trim();
      console.log('✅ סוכן העריכה סיים את התרגום והכתיבה בהצלחה!');
      
      return hebrewContent;

    } catch (error) {
      if (error.status === 503 && attempt < retries) {
        // חישוב זמן ההמתנה החדש: 15 שניות בניסיון ראשון, 30 שניות בניסיון שני
        const waitTimeInSeconds = attempt * 15;
        console.warn(`⚠️ שרת ה-API עמוס. ממתין ${waitTimeInSeconds} שניות ומנסה שוב...`);
        await sleep(waitTimeInSeconds * 1000); 
      } else {
        console.error('❌ שגיאה בסוכן העריכה:', error.message);
        return null; 
      }
    }
  }
}

module.exports = { translateAndEditNews };