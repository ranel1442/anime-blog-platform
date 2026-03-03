import { processArticleForReel } from './reelGenerator.js';
import { generateMayaVoice } from './audioGenerator.js';
import { generateMayaVideoFree } from './videoGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// פונקציית עזר להשהייה במקרה של עומס
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * המנצח על האוטומציה: מקבל כתבה ומפיק ממנה סרטון רילס סופי
 */
export async function createReelFromArticle(articleData, imageFilename = 'maya_base.jpg', retries = 3) {
    console.log("🎬 --- מתחיל תהליך יצירת רילס אוטומטי --- 🎬");
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // --- שלב 1: המוח (Gemini) ---
            console.log(`🧠 שלב 1/3 (ניסיון ${attempt}): יוצר תסריט...`);
            // אנו מעבירים את המודל המעודכן לפונקציית העיבוד (יש לוודא שב-reelGenerator.js הוא משתמש במודל המועבר או משנה אותו ידנית)
            const scriptData = await processArticleForReel(articleData, 'gemini-2.5-flash'); 
            console.log(`📝 תסריט הקריינות מוכן: "${scriptData.voiceover.substring(0, 30)}..."`);

            // --- שלב 2: הקול (Azure) ---
            console.log("🎙️ שלב 2/3: מייצר סאונד...");
            const timestamp = Date.now();
            const audioFilename = `maya_audio_${timestamp}.mp3`;
            const audioPath = await generateMayaVoice(scriptData.voiceover, audioFilename);

            // --- הכנת התמונה של מאיה ---
            const targetImagePath = path.resolve(__dirname, '../temp_reels', imageFilename);        

            // מעתיק את התמונה לתיקיית העבודה אם היא עדיין לא שם
            if (!fs.existsSync(targetImagePath)) {
                throw new Error(`תמונת הבסיס ${imageFilename} לא נמצאה בתיקיית temp_reels!`);
            }

            // --- שלב 3: הוידאו (Hugging Face) ---
            console.log("🎥 שלב 3/3: מסנכרן שפתיים ומייצר וידאו...");
            const videoFilename = `maya_reel_${timestamp}.mp4`;
            const videoPath = await generateMayaVideoFree(audioFilename, imageFilename, videoFilename);

            console.log("✨ --- תהליך יצירת הרילס הושלם בהצלחה! --- ✨");
            
            // מחזירים אובייקט מסודר עם כל מה שצריך כדי להציג באתר/דאטה-בייס
            return {
                success: true,
                videoLocalPath: videoPath,
                audioLocalPath: audioPath,
                caption: scriptData.caption,
                backgroundPrompt: scriptData.background_prompt 
            };

        } catch (error) {
            // אם יש שגיאת עומס 503 ועוד נשארו ניסיונות - נמתין וננסה שוב
            if (error.status === 503 && attempt < retries) {
                const waitTimeInSeconds = attempt * 15;
                console.warn(`⚠️ שרת ה-API עמוס. המנצח ממתין ${waitTimeInSeconds} שניות ומנסה שוב...`);
                await sleep(waitTimeInSeconds * 1000); 
            } else {
                // אם זה הניסיון האחרון או שיש שגיאה אחרת - נחזיר שגיאה
                console.error("❌ התהליך נכשל באחד השלבים:", error);
                return { success: false, error: error.message };
            }
        }
    }
}

// ==========================================
// טסט מקומי להרצה דרך הטרמינל
// ==========================================
async function runLocalTest() {
    const sampleArticle = {
        title: "המדריך המלא למתכנת המתחיל",
        content: "צעד ראשון בעולם התכנות הוא הבנת הלוגיקה. לא משנה אם תבחרו בפייתון או ג'אווה סקריפט, הבסיס הוא לדעת איך לגשת לפתרון בעיות ולחלק אותן לשלבים קטנים.",
        imageUrl: "https://example.com/placeholder.jpg"
    };

    const result = await createReelFromArticle(sampleArticle);
    
    if (result.success) {
        console.log("\n✅ הכל עובד! התוצאה הסופית:");
        console.log("נתיב הוידאו:", result.videoLocalPath);
        console.log("הכיתוב שיופיע מתחת לוידאו:", result.caption);
    }
}

// הורד את ההערה (//) מהשורה הבאה כדי להריץ טסט:
// runLocalTest();