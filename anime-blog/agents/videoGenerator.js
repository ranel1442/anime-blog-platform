import Replicate from "replicate";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                            use_enhancer: true, // מפעיל את משפר הפנים לאיכות גבוהה (GFPGAN)
                            still_mode: true,   // שומר על יציבות הגוף ומתמקד בראש
                            preprocess: "full"  // חותך ומתאים את התמונה בצורה אופטימלית
                        }
                    }
                );
        // Replicate יכול להחזיר מערך או מחרוזת, אנחנו מוודאים שלוקחים את הלינק
        const finalUrl = Array.isArray(outputUrl) ? outputUrl[0] : outputUrl;
        console.log("✅ [Video Generator] הוידאו מוכן בענן! מוריד אותו אליך...");
        
        // מורידים את קובץ ה-MP4 למחשב שלך
        const response = await fetch(finalUrl);
        if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
        
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));

        console.log(`🎉 [Video Generator] הוידאו נשמר בהצלחה: ${outputPath}`);
        return outputPath;

    } catch (error) {
        console.error("❌ [Video Generator] שגיאה ב-Replicate:", error);
        throw error;
    }
}