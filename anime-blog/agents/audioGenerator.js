import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// סידור נתיבים חכם לפי מבנה הפרויקט שלך
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// משיכת משתני הסביבה מקובץ ה-.env שנמצא תיקייה אחת למעלה (בשורש)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.GOOGLE_TTS_API_KEY;

export async function generateMayaVoice(text, outputFilename) {
    console.log(`[Audio Generator] מתחיל לייצר סאונד בחינם דרך Google Cloud TTS...`);
    
    // הגדרת נתיב השמירה: תיקיית temp_reels בשורש הפרויקט
    const outputPath = path.resolve(__dirname, '../temp_reels', outputFilename);

    // יצירת התיקייה במידה והיא לא קיימת
    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    try {
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;
        
        const requestBody = {
            input: { text: text },
            voice: { 
                languageCode: 'he-IL', 
                name: 'he-IL-Wavenet-A' // קול נשי איכותי (WaveNet) בעברית
            },
            audioConfig: { 
                audioEncoding: 'MP3',
                speakingRate: 1.0 // אפשר לשנות אם היא מדברת מהר/לאט מדי
            }
        };

        // פנייה ישירה ל-API של גוגל
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google TTS API Error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // גוגל מחזיר את האודיו כטקסט (Base64), אז אנחנו ממירים אותו לקובץ MP3 אמיתי
        const audioBuffer = Buffer.from(data.audioContent, 'base64');
        fs.writeFileSync(outputPath, audioBuffer);

        console.log(`[Audio Generator] קובץ האודיו של מאיה נשמר בהצלחה: ${outputPath}`);
        return outputPath;

    } catch (error) {
        console.error("❌ [Audio Generator] שגיאת מערכת מול Google:", error);
        throw error;
    }
}

























// הקובץ הזה הוא סוכן שמייצר אודיו באמצעות Azure Cognitive Services Text-to-Speech. הוא מקבל טקסט ומייצר קובץ אודיו בפורמט MP3 עם קול של הילה בעברית. הקובץ נשמר בתיקיית temp_reels בשורש הפרויקט. הסוכן משתמש במפתחות API שנמשכים מקובץ .env כדי להתחבר לשירות של Azure. אם יש בעיה ביצירת האודיו, הסוכן מדווח על השגיאה ומחזיר אותה למי שקרא לו.



// import * as sdk from "microsoft-cognitiveservices-speech-sdk";
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';

// // סידור נתיבים חכם לפי מבנה הפרויקט שלך
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // משיכת משתני הסביבה מקובץ ה-.env שנמצא תיקייה אחת למעלה (בשורש)
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const API_KEY = process.env.AZURE_SPEECH_KEY;
// const REGION = process.env.AZURE_SPEECH_REGION;

// export async function generateMayaVoice(text, outputFilename) {
//     console.log(`[Audio Generator] מתחיל לייצר סאונד בחינם דרך Azure...`);
    
//     // הגדרת נתיב השמירה: תיקיית temp_reels בשורש הפרויקט
//     const outputPath = path.resolve(__dirname, '../temp_reels', outputFilename);

//     // יצירת התיקייה במידה והיא לא קיימת
//     if (!fs.existsSync(path.dirname(outputPath))) {
//         fs.mkdirSync(path.dirname(outputPath), { recursive: true });
//     }

//     return new Promise((resolve, reject) => {
//         const speechConfig = sdk.SpeechConfig.fromSubscription(API_KEY, REGION);
        
//         // בחירת הקול של הילה והגדרת איכות סאונד
//         speechConfig.speechSynthesisVoiceName = "he-IL-HilaNeural";
//         speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

//         const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
//         const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

//         synthesizer.speakTextAsync(
//             text,
//             (result) => {
//                 if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
//                     console.log(`[Audio Generator] קובץ האודיו של מאיה נשמר בהצלחה: ${outputPath}`);
//                     synthesizer.close();
//                     resolve(outputPath);
//                 } else {
//                     console.error("[Audio Generator] שגיאה ביצירת האודיו:", result.errorDetails);
//                     synthesizer.close();
//                     reject(new Error(result.errorDetails));
//                 }
//             },
//             (error) => {
//                 console.error("[Audio Generator] שגיאת מערכת מול Azure:", error);
//                 synthesizer.close();
//                 reject(error);
//             }
//         );
//     });
// }