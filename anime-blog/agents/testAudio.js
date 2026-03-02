import { generateMayaVoice } from './audioGenerator.js';

async function runTest() {
    console.log("🎙️ מתחיל בדיקת קול עבור מאיה...");
    const testText = "היי רנאל! זה ניסיון הקלטה. החיבור למיקרוסופט עובד מצוין.";
    
    try {
        const filePath = await generateMayaVoice(testText, 'maya_test.mp3');
        console.log(`✅ הבדיקה עברה! הקובץ נמצא כאן: ${filePath}`);
    } catch (error) {
        console.error("❌ הבדיקה נכשלה:", error);
    }
}

runTest();