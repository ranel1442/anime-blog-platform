"use client";
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import { Loader2, Heart, MessageSquare, Send, Calendar, Flame } from 'lucide-react';

export default function SinglePostPage() {
  const params = useParams();
  const { id } = params;
  const { user, token } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const [postRes, commentsRes, allPublishedRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/comments/post/${id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/published`)
        ]);
        
        setPost(postRes.data);
        setComments(commentsRes.data);

        const topFeatured = allPublishedRes.data
          .filter(p => p.isFeatured && p._id !== id)
          .sort((a, b) => new Date(b.featuredAt || 0) - new Date(a.featuredAt || 0))
          .slice(0, 4);
          
        setFeaturedPosts(topFeatured);

      } catch (error) {
        console.error("שגיאה בטעינת הנתונים:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  const handleLike = async () => {
    if (!user) return alert("יש להתחבר כדי לעשות לייק! 💖");
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost({ ...post, likes: new Array(res.data.likesCount).fill('like') });
    } catch (error) {
      console.error("שגיאה בלייק:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/comments`, 
        { postId: id, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newCommentData = {
        ...res.data.comment,
        userId: { username: user.username, avatarUrl: user.avatarUrl }
      };
      setComments([newCommentData, ...comments]); // מציג את התגובה החדשה למעלה
      setNewComment(""); 
    } catch (error) {
      console.error("שגיאה בהוספת תגובה:", error);
      alert("הייתה בעיה בשליחת התגובה.");
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;
  if (!post) return <div className="min-h-screen flex justify-center items-center text-2xl text-zinc-500">הפוסט לא נמצא 😢</div>;

  return (
    <main className="flex-grow py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
      
      {/* --- מבנה של שתי עמודות (סרגל צד + פוסט מרכזי) --- */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* --- עמודה ימנית: סרגל התגובות (Sidebar) --- */}
        {/* order-2 במובייל כדי שיופיע מתחת לפוסט, order-1 בדסקטופ שיהיה מימין */}
        <div className="w-full lg:w-[35%] order-2 lg:order-1 sticky top-24 flex flex-col gap-6">
          <div className="bg-[#1c1c24] rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-800">
            
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <MessageSquare className="w-6 h-6 text-purple-500" /> 
              תגובות אחרונות:
            </h3>

            {user ? (
              <form onSubmit={handleAddComment} className="mb-8 flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border-2 border-purple-500/50 shadow-sm" />
                  <span className="text-zinc-300 font-bold text-sm">הוסף תגובה כ-{user.username}</span>
                </div>
                <textarea 
                  rows="3"
                  placeholder="מה דעתך על הכתבה? שתף אותנו..." 
                  className="w-full bg-[#121217] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-zinc-600 border border-zinc-800 resize-none text-sm"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition shadow-lg shadow-purple-600/20 font-bold w-full text-sm">
                  <Send className="w-4 h-4 ml-2" /> שלח תגובה
                </button>
              </form>
            ) : (
              <div className="bg-[#121217] p-4 rounded-xl text-center text-zinc-400 mb-8 border border-zinc-800 text-sm">
                עליך להתחבר כדי להשאיר תגובה.
              </div>
            )}

            {/* רשימת התגובות בסרגל הצד */}
            <div className="flex flex-col gap-5 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 group">
                  <img src={comment.userId?.avatarUrl || 'https://via.placeholder.com/40'} alt="avatar" className="w-10 h-10 rounded-full border border-zinc-700 flex-shrink-0" />
                  <div className="bg-[#121217] border border-zinc-800 p-4 rounded-2xl rounded-tr-none flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-purple-400 text-sm">{comment.userId?.username || 'משתמש אנונימי'}</div>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                  <div className="text-center text-zinc-500 py-6 font-medium text-sm border border-dashed border-zinc-800 rounded-xl">
                    היה הראשון לכתוב תגובה!
                  </div>
              )}
            </div>

          </div>
        </div>


        {/* --- עמודה שמאלית: הכתבה עצמה --- */}
        <div className="w-full lg:w-[65%] order-1 lg:order-2">
          <div className="bg-[#1c1c24] rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 mb-16">
            
            {post.coverImage && (
              <div className="relative border-b border-zinc-800">
                  <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-[450px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c24] via-[#1c1c24]/60 to-transparent opacity-90"></div>
              </div>
            )}

            <div className="p-8 md:p-12 relative z-10 -mt-20 md:-mt-32">
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
                <div className="flex gap-2">
                  {post.tags?.map((tag, idx) => (
                    <span key={idx} className="bg-purple-600 text-white px-4 py-1.5 rounded-md font-bold shadow-lg shadow-purple-900/50">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-medium bg-[#121217] px-3 py-1.5 rounded-lg border border-zinc-800">
                  <Calendar className="w-4 h-4 text-purple-500" /> 
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('he-IL')}
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight drop-shadow-md">
                {post.title}
              </h1>
              
              <div className="prose prose-invert max-w-none">
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed whitespace-pre-wrap mb-10">
                    {post.content}
                  </p>
              </div>

              <div className="border-t border-zinc-800 pt-8 mt-12 flex justify-end">
                <button 
                  onClick={handleLike} 
                  className="flex items-center gap-2 text-zinc-300 hover:text-purple-400 transition font-bold text-lg bg-[#121217] hover:bg-purple-900/20 px-8 py-3 rounded-xl border border-zinc-800 hover:border-purple-500/50 shadow-lg"
                >
                  <Heart className={`w-6 h-6 ${post.likes?.includes(user?.id) ? 'fill-purple-500 text-purple-500' : ''}`} /> 
                  {post.likes?.length || 0} אהבו את הכתבה
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* --- אזור "איך פספסתם?!" --- */}
      {featuredPosts.length > 0 && (
        <div className="mt-12 pt-12 border-t-2 border-zinc-800/80 relative">
          
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
             <span className="bg-purple-600 text-white px-6 py-2 rounded-lg font-black text-xl md:text-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 tracking-wide uppercase">
               <Flame className="w-6 h-6 fill-current" /> איך פספסתם?!
             </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {featuredPosts.map(fp => (
              <Link href={`/post/${fp._id}`} key={fp._id} className="block bg-[#1c1c24] rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] group">
                <div className="h-36 relative overflow-hidden">
                  <img src={fp.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000'} alt={fp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {fp.tags && fp.tags.length > 0 && (
                    <span className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {fp.tags[0]}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold line-clamp-2 text-sm md:text-base group-hover:text-purple-400 transition-colors">
                    {fp.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}