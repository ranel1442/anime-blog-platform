import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// 1. משיכת המפתחות ופיצולם למערך
const apiKeys = process.env.GEMINI_API_KEY.split(',');

// 2. משתנה גלובלי - מתחיל מ-3 (מפתח רביעי)
let currentKeyIndex = 3; 

// פונקציית עזר להשהייה
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function processArticleForReel(articleData, modelName = 'gemini-2.5-flash') {
    const { title, content, imageUrl } = articleData;

    console.log(`[Reel Generator] מתחיל עיבוד לכתבה: ${title}`);

    // --- לוגיקת החלפת המפתחות (Round-Robin) ---
    const activeKey = apiKeys[currentKeyIndex];
    console.log(`[Reel Generator] משתמש במפתח API מספר: ${currentKeyIndex + 1} מתוך ${apiKeys.length}`);

    // קידום האינדקס לפעם הבאה.
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

    // אתחול הקליינט של ג'מיני
    const genAI = new GoogleGenerativeAI(activeKey);

    // נשתמש בשם המודל שמועבר מבחוץ (ברירת מחדל: gemini-2.5-flash)
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
        }
    });

    const prompt = `
        אתה תסריטאי מומחה לתוכן ויראלי ברשתות חברתיות (TikTok, Reels, Shorts).
        אתה כותב עבור "מאיה" – הפרזנטורית הדיגיטלית שלנו.
        
        דמותה של מאיה: צעירה, אנרגטית, מקצועית, מדברת בגובה העיניים ובקצב מהיר.
        
        המשימה: להפוך את הכתבה המצורפת לתסריט וידאו של עד 60 שניות.
        
        מבנה ה-voiceover (חובה):
        1. הוק (Hook) חזק ב-5 השניות הראשונות: משפט שגורם לצופה לעצור את הגלילה (שאלה מסקרנת, עובדה מפתיעה או הצהרה נועזת).
        2. גוף הסרטון: סיכום הכתבה בצורה קולחת ומעניינת (עד 100 מילים בסך הכל).
        3. סיומת: שאלה אישית המופנית לצופים בנושא הכתבה כדי לעורר דיון.
        4. קריאה לפעולה (CTA) קבועה: מיד אחרי השאלה עליה לומר: "תרשמו לי בתגובות מה אתם חושבים, ואל תשכחו לעקוב לעוד כתבות כאלה".

        עליך להחזיר אך ורק פורמט JSON תקין עם השדות הבאים:
        1. "voiceover": הטקסט המלא שמאיה תקריא בעברית (כולל ההוק והסיומת).
        2. "background_prompt": תיאור קצר באנגלית עבור AI ליצירת תמונת רקע/אווירה שמתאימה לתוכן הכתבה.
        3. "caption": טקסט לפוסט שכולל: סיכום במשפט, הזמנה לאתר ("לכתבה המלאה היכנסו לאתר שלנו") והאשטאגים רלוונטיים.

        נתוני הכתבה:
        כותרת: ${title}
        תוכן: ${content}
        `;

    // כאן, ה-Retry מטופל בקובץ הראשי (reelsOrchestrator), אז אנחנו פשוט מנסים פעם אחת
    // וזורקים שגיאה למעלה אם נכשל
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const parsedData = JSON.parse(responseText);
        
        console.log("[Reel Generator] התסריט למאיה מוכן בהצלחה!");
        return {
            originalImage: imageUrl,
            ...parsedData
        };

    } catch (error) {
        console.error("[Reel Generator] שגיאה ביצירת התוכן:", error.message);
        throw error; // זורקים הלאה ל-orchestrator כדי שיטפל בהמתנה!
    }
}