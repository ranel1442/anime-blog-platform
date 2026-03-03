const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// משתנה שחי בזיכרון של השרת וזוכר איזה מפתח בתור
let currentKeyIndex = 0;

function getNextApiKey() {
  // קריאת המחרוזת מה-env ותמיכה בשם משתנה יחיד או רבים
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  const keysArray = keysString.split(',');

  // שליפת המפתח הנוכחי וניקוי רווחים
  const selectedKey = keysArray[currentKeyIndex].trim();

  // קידום התור לפעם הבאה! 
  currentKeyIndex = (currentKeyIndex + 1) % keysArray.length;

  console.log(`🔑 משתמש במפתח מספר ${currentKeyIndex === 0 ? keysArray.length : currentKeyIndex} מתוך ${keysArray.length}`);
  
  return selectedKey;
}

// פונקציית עזר להשהייה במקרה של עומס
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function enhancePostData(originalTitle, hebrewContent, retries = 3) {
  // 1. שולפים מפתח חדש מתוך ה"רולטה" בכל פעם שהפונקציה רצה!
  const currentApiKey = getNextApiKey();
  
  // 2. מאתחלים את החיבור ל-AI עם המפתח שנבחר
  const ai = new GoogleGenAI({ apiKey: currentApiKey });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🎨 סוכן הקריאייטיב (ניסיון ${attempt}) חושב על כותרת, תגיות ותמונה...`);
      
      const prompt = `
      קרא את הפוסט הבא שנכתב לבלוג אנימה:
      "${hebrewContent}"

      המשימה שלך היא להחזיר אובייקט JSON חוקי בלבד (ללא טקסט נוסף, ללא הקדמות, וללא Markdown) עם השדות הבאים:
      1. "title": כותרת קליק-בייט בעברית בלבד, מושכת, מסקרנת, שגורמת ללחוץ (עד 10 מילים).
      2. "tags": מערך של 3-5 תגיות רלוונטיות בעברית (למשל: ["חדשות אנימה", "מנגה", "אקשן"]).
      3. "imagePrompt": פרומפט מפורט באנגלית ליצירת תמונות רקע שקשורה באופן ישיר לכתבה הרלוונטית.
      
      IMPORTANT RULES FOR "imagePrompt":
      - Always start the prompt with: "High quality anime art style, masterpiece, trending on artstation".
      - Make the lighting dramatic and cinematic.
      - Do NOT include any text, words, letters, or speech bubbles in the image.
      - Keep it descriptive, focusing on characters, background, and colors.
      `;

      // 3. שימוש נכון במודל העדכני והיציב
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      // ניקוי התשובה מתוספות שאולי ה-AI הוסיף (כמו \`\`\`json)
      const textRes = response.text.trim().replace(/```json/g, '').replace(/```/g, '');
      
      // הפיכת הטקסט לאובייקט ג'אווה-סקריפט אמיתי
      const creativeData = JSON.parse(textRes);
      
      console.log(`✅ סוכן הקריאייטיב סיים! כותרת נבחרה: "${creativeData.title}"`);
      return creativeData;

    } catch (error) {
      // אם יש שגיאת עומס 503 ועוד נשארו ניסיונות - נמתין וננסה שוב
      if (error.status === 503 && attempt < retries) {
        const waitTimeInSeconds = attempt * 15;
        console.warn(`⚠️ שרת ה-API עמוס. סוכן הקריאייטיב ממתין ${waitTimeInSeconds} שניות ומנסה שוב...`);
        await sleep(waitTimeInSeconds * 1000); 
      } else {
        // אם זה הניסיון האחרון או שיש שגיאה אחרת (כמו JSON לא תקין) - נחזיר גיבוי
        console.error('❌ שגיאה בסוכן הקריאייטיב (משתמש בברירת מחדל):', error.message);
        return {
            title: `עדכון חם: ${originalTitle}`,
            tags: ['חדשות', 'אנימה'],
            imagePrompt: 'High quality anime art style, masterpiece, cinematic lighting, no text'
        };
      }
    }
  }
}

module.exports = { enhancePostData };