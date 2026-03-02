"use client";
import { MessageCircle, Instagram, AlertTriangle, Briefcase, MessageSquare, ShieldAlert } from 'lucide-react';

export default function ContactPage() {
  // ==========================================
  // ⚙️ הגדרות קישורים (הכנס את הפרטים שלך כאן)
  // ==========================================
  const WHATSAPP_NUMBER = "972500000000"; // הכנס את המספר שלך (ללא פלוס, מתחיל ב-972)
  const INSTAGRAM_HANDLE = "your_page_name"; // הכנס את שם המשתמש באינסטגרם
  
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
  const instagramUrl = `https://instagram.com/${INSTAGRAM_HANDLE}`;

  return (
    <main className="flex-grow py-12 px-4 md:px-8 relative min-h-screen flex items-center">
      {/* אפקטי תאורה ברקע */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto w-full relative z-10">
        
        {/* כותרת העמוד */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            דברו <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">איתנו</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            יש לכם שאלה? הצעה עסקית? או שאולי זיהיתם תוכן שצריך לרדת מהאתר? <br/> אנחנו זמינים וקוראים כל הודעה!
          </p>
        </div>

        {/* למה לפנות אלינו? (שקיפות ומשפטי) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          
          <div className="bg-[#1c1c24] border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="w-12 h-12 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">סתם לדבר</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              רוצים להמליץ על סדרת אנימה? לתת פידבק על האתר? או סתם להגיד שלום? אנחנו תמיד שמחים להכיר את הקהילה שלנו.
            </p>
          </div>

          <div className="bg-[#1c1c24] border border-zinc-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-1 bg-rose-500/50"></div>
            <div className="w-12 h-12 bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">דיווח על תוכן</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              זיהיתם תגובה פוגענית, ספאם, או הפרת זכויות יוצרים? שלחו לנו קישור וצילום מסך, ואנחנו נסיר את התוכן בהקדם (נוהל הודעה והסרה).
            </p>
          </div>

          <div className="bg-[#1c1c24] border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="w-12 h-12 bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
              <Briefcase className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">הצעות עסקיות</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              מעוניינים לפרסם באתר? לשתף פעולה? או להקים פרויקט משותף בעולם האנימה? דברו איתנו ונקבע פגישה.
            </p>
          </div>

        </div>

        {/* דרכי התקשרות (כפתורים גדולים) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          {/* כפתור אינסטגרם */}
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative bg-[#1c1c24] border border-zinc-800 hover:border-pink-500/50 p-8 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.3)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
              <Instagram className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">הודעה באינסטגרם</h2>
            <p className="text-zinc-400 font-medium">עקבו אחרינו ושלחו DM (הודעה פרטית). אנחנו עונים שם הכי מהר!</p>
          </a>

          {/* כפתור וואטסאפ */}
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative bg-[#1c1c24] border border-zinc-800 hover:border-green-500/50 p-8 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">שיחה בוואטסאפ</h2>
            <p className="text-zinc-400 font-medium">צריכים עזרה דחופה? דיווח מהיר? סמסו לנו ישירות למספר של האתר.</p>
          </a>

        </div>

      </div>
    </main>
  );
}



// לא לשכוח!!!!


// להוסיף את הפרטים שלך: בקוד עצמו (שורות 8 ו-9), איפה שכתוב WHATSAPP_NUMBER ו-INSTAGRAM_HANDLE, שים לב להכניס את המספר שלך (בלי פלוס, ומתחיל ב-972, לדוגמה 972501234567) ואת שם המשתמש באינסטגרם (ללא ה-@, לדוגמה anime_il).

// לינק בתפריט: אל תשכח להוסיף קישור לעמוד ה- /contact בתוך קומפוננטת ה-Navbar שלך כדי שאנשים יוכלו להגיע אליו בקלות!