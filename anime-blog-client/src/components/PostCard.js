import Link from 'next/link';
import { Calendar, Bot } from 'lucide-react';

export default function PostCard({ post }) {
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('he-IL', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Link href={`/post/${post._id}`} className="block h-full cursor-pointer">
      {/* פה נמצא אפקט הזוהר והמסגרת של הכרטיסייה */}
      <div className="bg-[#1c1c24] rounded-xl overflow-hidden border-2 border-purple-600 transition-all duration-300 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] flex flex-col h-full group">
        <div className="relative h-56 overflow-hidden bg-[#121217] border-b-2 border-purple-900/30 group-hover:border-purple-500/50 transition-colors duration-300">
          {post.coverImage ? (
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100" 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-700">אין תמונה</div>
          )}
          
          {/* גרדיאנט שחור עדין בתחתית התמונה */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1c1c24] to-transparent pointer-events-none opacity-80"></div>
          
          {/* תגיות מרחפות בחלק התחתון - מקסימום 3 */}
          {post.tags && post.tags.length > 0 && (
            <div className="absolute bottom-3 right-3 left-3 flex flex-wrap gap-2 pointer-events-none">
              
              {/* חותכים את המערך כדי להציג רק את ה-3 הראשונים */}
              {post.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-purple-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg pointer-events-auto truncate max-w-[120px]"
                  title={tag} // מאפשר לראות את כל השם ברחרוף אם התגית ארוכה מדי ונחתכה
                >
                  {tag}
                </span>
              ))}

              {/* בועה קטנה שמציגה כמה תגיות נוספות יש (אם יש יותר מ-3) */}
              {post.tags.length > 3 && (
                <span className="bg-zinc-800/90 backdrop-blur-sm text-zinc-300 text-xs font-bold px-2 py-1.5 rounded-md shadow-lg pointer-events-auto">
                  +{post.tags.length - 3}
                </span>
              )}

            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-2xl font-black text-zinc-100 mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {post.title}
          </h2>
          <p className="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed">
            {truncateText(post.content, 120)}
          </p>

          <div className="mt-auto pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Calendar className="w-4 h-4" />{formattedDate}
            </div>
            {/* תגית ה-AI רובוט ירדה לבקשתך בעבר */}
          </div>
        </div>
      </div>
    </Link>
  );
}