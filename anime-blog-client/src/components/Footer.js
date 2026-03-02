import Link from 'next/link';
import { ShieldAlert, Bot, Scale, Code, Heart, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#121217] border-t border-zinc-800/80 mt-20 relative overflow-hidden">
      
      {/* אפקטי תאורה עדינים ברקע הפוטר */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-zinc-900/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-6 relative z-10">
        
        {/* אזור הטקסטים המשפטיים */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-zinc-800/50 pb-10">
          
          {/* בלוק 1: הבהרת AI ואחריות תוכן */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" /> אודות התוכן באתר (AI)
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              האתר הינו בלוג קהילתי ללא מטרות רווח, שהוקם מאהבה לעולם האנימה. חשוב לדעת: חלק ניכר מהחדשות והכתבות הרשמיות באתר מופקות, מתורגמות או מסוכמות באמצעות מערכות בינה מלאכותית (AI). בשל כך, ייתכנו שגיאות, אי-דיוקים או מידע חסר. הקריאה וההסתמכות על התוכן באתר הינה על אחריות הקורא בלבד.
            </p>
          </div>

          {/* בלוק 2: זכויות יוצרים, תנאי שימוש והסרה */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" /> זכויות יוצרים ותנאי שימוש
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              אנו פועלים תחת עקרון "שימוש הוגן" ומכבדים לחלוטין את היוצרים המקוריים. אין לנו כוונה להפר זכויות יוצרים. כל התמונות והתכנים שייכים ליוצריהם החוקיים. במידה וזיהיתם תוכן המפר זכויות, טעות מהותית, או תגובת גולשים פוגענית – אנא פנו אלינו מיד והתוכן יוסר בהקדם האפשרי (נוהל הודעה והסרה).
            </p>
            <div className="pt-2">
              <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors">
                <ShieldAlert className="w-4 h-4" /> דיווח על תוכן בעייתי (צור קשר)
              </Link>
            </div>
          </div>

        </div>

        {/* פס תחתון: זכויות שמורות וקרדיט מפתח */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-zinc-500">
          
          <div className="flex items-center gap-1.5">
            © {currentYear} קהילת האנימה של ישראל. כל הזכויות שמורות.
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-zinc-300 transition">עמוד הבית</Link>
            <span>•</span>
            <Link href="/community" className="hover:text-zinc-300 transition">הקהילה</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-zinc-300 transition">יצירת קשר</Link>
          </div>

          {/* הקרדיט שלך! */}
          <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <Code className="w-3.5 h-3.5 text-zinc-400" />
            <span>אופיין ונבנה ע"י</span>
            <span className="text-zinc-300 font-bold tracking-wide">RSS בניית אתרים</span>
          </div>

        </div>
      </div>
    </footer>
  );
}