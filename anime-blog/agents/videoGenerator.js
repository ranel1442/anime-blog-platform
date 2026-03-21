import Replicate from "replicate";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// פונקציית עזר להשהייה במקרה של ניתוק
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// המערכת מושכת אוטומטית את המפתח מקובץ ה-.env
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * מייצר וידאו דרך Replicate (SadTalker על שרתי GPU עוצמתיים)
 */
export async function generateMayaVideoFree(audioFilename, imageFilename, videoFilename) {
    console.log("🚀 [Video Generator] מתחבר ל-Replicate...");

    const audioPath = path.resolve(__dirname, '../temp_reels', audioFilename);
    const imagePath = path.resolve(__dirname, '../temp_reels', imageFilename);
    const outputPath = path.resolve(__dirname, '../temp_reels', videoFilename);

    // ממירים את הקבצים שלנו לפורמט Base64 כדי שיישלחו בבטחה בענן
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    const imageUri = `data:image/jpeg;base64,${imageBase64}`;
    
    const audioBase64 = fs.readFileSync(audioPath, { encoding: 'base64' });
    const audioUri = `data:audio/mp3;base64,${audioBase64}`;

    try {
        console.log("⏳ [Video Generator] שולח נתונים לרינדור מואץ... (זה ייקח כדקה)");
                
        // קריאה למודל SadTalker המעודכן והרשמי ב-Replicate
        const outputUrl = await replicate.run(
            "cjwbw/sadtalker:a519cc0cfebaaeade068b23899165a11ec76aaa1d2b313d40d214f204ec957a3",
            {
                input: {
                    source_image: imageUri,
                    driven_audio: audioUri,
                    use_enhancer: false, // מפעיל את משפר הפנים לאיכות גבוהה (GFPGAN)
                    still_mode: true,   // שומר על יציבות הגוף ומתמקד בראש
                    preprocess: "full"  // חותך ומתאים את התמונה בצורה אופטימלית
                }
            }
        );
        
        // Replicate יכול להחזיר מערך או מחרוזת, אנחנו מוודאים שלוקחים את הלינק
        const finalUrl = Array.isArray(outputUrl) ? outputUrl[0] : outputUrl;
        console.log("✅ [Video Generator] הוידאו מוכן בענן! מנסה להוריד אותו...");
        
        // === מנגנון הורדה חסין תקלות ===
        const maxRetries = 3;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📥 מתחיל הורדה (ניסיון ${attempt} מתוך ${maxRetries})...`);
                
                // הוספת מנגנון Timeout שימנע מההורדה להיתקע לנצח
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 120000); // מאפשר עד שתי דקות להורדה

                const response = await fetch(finalUrl, { signal: controller.signal });
                clearTimeout(timeoutId); // מנקה את הטיימר אם ההורדה הצליחה

                if (!response.ok) throw new Error(`שגיאת שרת בהורדה: ${response.statusText}`);
                
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(outputPath, Buffer.from(buffer));
                
                console.log(`🎉 [Video Generator] הוידאו נשמר בהצלחה: ${outputPath}`);
                break; // יציאה מהלולאה כי ההורדה הצליחה!
                
            } catch (downloadError) {
                console.warn(`⚠️ שגיאה בהורדת הוידאו בניסיון ${attempt}:`, downloadError.message);
                if (attempt < maxRetries) {
                    const waitTime = attempt * 10; // נמתין 10 שניות, ואז 20 שניות
                    console.log(`ממתין ${waitTime} שניות ומנסה שוב...`);
                    await sleep(waitTime * 1000);
                } else {
                    // אם כשלנו בכל הניסיונות, נזרוק את השגיאה החוצה
                    throw new Error(`נכשל בהורדת הוידאו מ-Replicate לאחר ${maxRetries} ניסיונות.`);
                }
            }
        }

        return outputPath;

    } catch (error) {
        console.error("❌ [Video Generator] שגיאה ב-Replicate:", error);
        throw error;
    }
}