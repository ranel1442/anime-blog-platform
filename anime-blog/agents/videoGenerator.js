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
 * מייצר וידאו דרך Replicate (LivePortrait - מהיר, זול ואיכותי מאוד)
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
        console.log("⏳ [Video Generator] שולח נתונים למודל LivePortrait... (זה ייקח כ-15-20 שניות)");
                
        // קריאה למודל LivePortrait החדש
        const outputUrl = await replicate.run(
            "lucataco/liveportrait:9d15024b801452243d6e520eb070cf613c72b53589b2512a86ff43309a6c7ec6",
            {
                input: {
                    image: imageUri, // שים לב: שינינו מ-source_image
                    audio: audioUri  // שים לב: שינינו מ-driven_audio
                }
            }
        );
        
        // Replicate יכול להחזיר מערך או מחרוזת, אנחנו מוודאים שלוקחים את הלינק הראשון
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








































// import Replicate from "replicate";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // המערכת מושכת אוטומטית את המפתח מקובץ ה-.env
// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN,
// });

// /**
//  * מייצר וידאו דרך Replicate (SadTalker על שרתי GPU עוצמתיים)
//  */
// export async function generateMayaVideoFree(audioFilename, imageFilename, videoFilename) {
//     console.log("🚀 [Video Generator] מתחבר ל-Replicate...");

//     const audioPath = path.resolve(__dirname, '../temp_reels', audioFilename);
//     const imagePath = path.resolve(__dirname, '../temp_reels', imageFilename);
//     const outputPath = path.resolve(__dirname, '../temp_reels', videoFilename);

//     // ממירים את הקבצים שלנו לפורמט Base64 כדי שיישלחו בבטחה בענן
//     const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
//     const imageUri = `data:image/jpeg;base64,${imageBase64}`;
    
//     const audioBase64 = fs.readFileSync(audioPath, { encoding: 'base64' });
//     const audioUri = `data:audio/mp3;base64,${audioBase64}`;

//     try {
//         console.log("⏳ [Video Generator] שולח נתונים לרינדור מואץ... (זה ייקח כדקה)");
                
//                 // קריאה למודל SadTalker המעודכן והרשמי ב-Replicate
//                 const outputUrl = await replicate.run(
//                     "cjwbw/sadtalker:a519cc0cfebaaeade068b23899165a11ec76aaa1d2b313d40d214f204ec957a3",
//                     {
//                         input: {
//                             source_image: imageUri,
//                             driven_audio: audioUri,
//                             use_enhancer: true, // מפעיל את משפר הפנים לאיכות גבוהה (GFPGAN)
//                             still_mode: true,   // שומר על יציבות הגוף ומתמקד בראש
//                             preprocess: "full"  // חותך ומתאים את התמונה בצורה אופטימלית
//                         }
//                     }
//                 );
//         // Replicate יכול להחזיר מערך או מחרוזת, אנחנו מוודאים שלוקחים את הלינק
//         const finalUrl = Array.isArray(outputUrl) ? outputUrl[0] : outputUrl;
//         console.log("✅ [Video Generator] הוידאו מוכן בענן! מוריד אותו אליך...");
        
//         // מורידים את קובץ ה-MP4 למחשב שלך
//         const response = await fetch(finalUrl);
//         if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
        
//         const buffer = await response.arrayBuffer();
//         fs.writeFileSync(outputPath, Buffer.from(buffer));

//         console.log(`🎉 [Video Generator] הוידאו נשמר בהצלחה: ${outputPath}`);
//         return outputPath;

//     } catch (error) {
//         console.error("❌ [Video Generator] שגיאה ב-Replicate:", error);
//         throw error;
//     }
// }