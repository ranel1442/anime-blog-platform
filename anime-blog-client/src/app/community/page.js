"use client";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';
import { Loader2, PlusCircle, MessageCircle, Heart, Trash2, Edit3, Save, X, Hash, ShieldAlert,ImageIcon } from 'lucide-react';

export default function CommunityPage() {
  const { user, token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // סטייטים ליצירת פוסט חדש
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [imageFile, setImageFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  // --- סטייטים למערכת התגובות ---
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState(null); // זוכר לאיזה פוסט מגיבים עכשיו
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null); // זוכר לאיזו תגובה עושים Reply עכשיו

  // סטייטים לעריכת פוסט (לאדמינים)
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/community-posts`);
        setPosts(res.data);
      } catch (error) {
        console.error("שגיאה במשיכת פוסטים של הקהילה:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityPosts();
  }, []);

const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return alert("חובה להזין כותרת ותוכן!");

    try {
      // 1. בונים "חבילה" מיוחדת שיודעת להכיל גם טקסטים וגם קבצים
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('content', newContent);
      
      // טיפול בתגיות (הפיכת המחרוזת למערך ואז לטקסט שהשרת ידע לקרוא)
      const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      formData.append('tags', JSON.stringify(tagsArray));

      // 2. אם המשתמש בחר תמונה, אנחנו מצרפים אותה לחבילה תחת השם 'image' (בדיוק מה ש-Multer מחפש!)
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // 3. שליחה לשרת! Axios חכם מספיק להבין שזה FormData ולסדר את ה-Headers לבד
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/community-posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
          // שים לב: לא כותבים פה Content-Type: application/json יותר!
        }
      });

      // 4. ניקוי הטופס אחרי ההצלחה
      setPosts([res.data.post, ...posts]);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setImageFile(null);
      setImagePreview(null);
      setShowCreateForm(false);

    } catch (error) {
      console.error("שגיאה ביצירת הפוסט:", error);
      alert("הייתה בעיה ביצירת הפוסט, נסה שוב.");
    }
  };

  // פונקציה חכמה לבדיקת תמונת פרופיל
  const getAvatarUrl = (profilePic, username) => {
    // אם התמונה חסרה, או שהיא מכילה את הטקסט של התמונה הישנה שלא קיימת
    if (!profilePic || profilePic.includes('default-avatar.png')) {
      // לוקחים את האות הראשונה של השם (או U אם אין שם)
      const initial = username ? username.charAt(0).toUpperCase() : 'U';
      return `https://ui-avatars.com/api/?name=${initial}&background=8b5cf6&color=fff&rounded=true`;
    }
    // אם זו תמונה אמיתית מהענן, נחזיר אותה כמו שהיא
    return profilePic;
  };


    // שליחת תגובה ראשית לפוסט
  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      // הכתובת המדויקת שבנינו בשרת
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}/comments`, 
        { content: commentText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // עדכון הסטייט: מחליפים את הפוסט הישן בפוסט החדש שחזר מהשרת (שכולל עכשיו את התגובה)
      setPosts(posts.map(p => p._id === postId ? res.data.post : p));
      setCommentText("");
      setActiveCommentPostId(null);
    } catch (error) {
      console.error("שגיאה בהוספת תגובה:", error);
      alert("הייתה בעיה בשליחת התגובה.");
    }
  };

  // שליחת תגובה לתגובה (Reply)
  const handleAddReply = async (postId, commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}/comments/${commentId}/replies`, 
        { content: replyText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPosts(posts.map(p => p._id === postId ? res.data.post : p));
      setReplyText("");
      setActiveReplyCommentId(null);
    } catch (error) {
      console.error("שגיאה בהוספת תגובה לתגובה:", error);
      alert("הייתה בעיה בשליחת התגובה.");
    }
  };

  // מחיקת תגובה ראשית
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק תגובה זו?")) return;
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // מעדכנים את הפיד בלי לרענן את העמוד
      setPosts(posts.map(p => p._id === postId ? res.data.post : p));
    } catch (error) {
      console.error("שגיאה במחיקת תגובה:", error);
      alert("לא ניתן למחוק תגובה זו.");
    }
  };

  // מחיקת תגובה לתגובה (Reply)
  const handleDeleteReply = async (postId, commentId, replyId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק תגובה זו?")) return;
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}/comments/${commentId}/replies/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.map(p => p._id === postId ? res.data.post : p));
    } catch (error) {
      console.error("שגיאה במחיקת תגובה:", error);
      alert("לא ניתן למחוק תגובה זו.");
    }
  };

  const handleLike = async (postId) => {
    if (!user) return alert("יש להתחבר כדי לעשות לייק!");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likes?.includes(user.id);
          let updatedLikes = [...(post.likes || [])];
          if (hasLiked) updatedLikes = updatedLikes.filter(id => id !== user.id);
          else updatedLikes.push(user.id);
          return { ...post, likes: updatedLikes };
        }
        return post;
      }));
    } catch (error) {
      console.error("שגיאה בלייק:", error);
    }
  };

  // --- פונקציות ניהול לאדמין ---
  const handleDeletePost = async (postId) => {
    if (!window.confirm("פעולת מנהל: האם אתה בטוח שברצונך למחוק פוסט זה לצמיתות?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      alert("שגיאה במחיקת הפוסט.");
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleUpdatePost = async (postId) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}`, 
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, title: editTitle, content: editContent } : post
      ));
      setEditingPostId(null);
    } catch (error) {
      alert("שגיאה בעדכון הפוסט.");
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;

  return (
    // הורדנו את ה-bg כדי שייקח את הרקע הכללי, הוספנו flex-grow
    <main className="flex-grow py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* אזור הכותרת */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">קהילת <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">האנימה</span></h1>
            <p className="text-zinc-400">המקום שלכם לדבר, לשתף ולחפור על הסדרות האהובות עליכם.</p>
          </div>
          
          {user && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 font-bold"
            >
              {showForm ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              {showForm ? 'ביטול' : 'פוסט חדש'}
            </button>
          )}
        </div>

        {/* טופס יצירת פוסט מעוצב וברור */}
        {showForm && (
          <form onSubmit={handleCreatePost} className="bg-[#1c1c24] p-8 rounded-3xl shadow-2xl border border-zinc-800 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-2xl font-black mb-6 text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-500" /> מה בא לך לשתף?
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">כותרת הפוסט</label>
                <input 
                  type="text" 
                  placeholder="לדוגמה: תאוריית סוף מטורפת על וואן פיס!" 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition placeholder-zinc-600"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">תוכן הפוסט</label>
                <textarea 
                  placeholder="כתוב את כל מה שעולה לך לראש..." 
                  rows="5"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none placeholder-zinc-600"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">תגיות (לא חובה)</label>
                <div className="relative">
                  <Hash className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="לדוגמה: וואן פיס, תאוריה, מנגה (מופרד בפסיקים)" 
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pr-12 pl-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm placeholder-zinc-600"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>
              </div>





                {/* אזור העלאת התמונה */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-center gap-2 cursor-pointer bg-[#121217] hover:bg-zinc-800 text-purple-400 px-4 py-3 rounded-xl transition border border-zinc-800 hover:border-purple-500/30 font-bold w-fit shadow-md">
                  <ImageIcon className="w-5 h-5" />
                  {imageFile ? 'שנה תמונה' : '📸 הוסף תמונה מהמכשיר'}
                  
                  {/* האינפוט האמיתי מוסתר, הלייבל מפעיל אותו */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file)); // יצירת קישור זמני לתצוגה המקדימה
                      }
                    }} 
                    className="hidden" 
                  />
                </label>
                
                {/* תצוגה מקדימה של התמונה לפני הפרסום */}
                {imagePreview && (
                  <div className="relative w-fit animate-in fade-in zoom-in duration-200">
                    <img src={imagePreview} alt="Preview" className="h-40 rounded-xl border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] object-cover" />
                    
                    {/* כפתור מחיקה (X) על התמונה */}
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(null); }} 
                      className="absolute -top-3 -right-3 bg-rose-600 text-white rounded-full p-1.5 shadow-lg hover:bg-rose-500 transition border border-zinc-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>






              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-purple-600/20 mt-4">
                פרסם פוסט בקהילה
              </button>
            </div>
          </form>
        )}

        {/* רשימת הפוסטים */}
        <div className="flex flex-col gap-6">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 bg-[#1c1c24] rounded-3xl border border-zinc-800">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
              <p className="text-xl font-medium">הקהילה עדיין שקטה... היה הראשון לכתוב פוסט!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="bg-[#1c1c24] p-6 md:p-8 rounded-3xl shadow-lg border border-zinc-800 hover:border-purple-500/50 transition-colors relative group">
                
                {/* כפתורי ניהול לאדמין במצב כהה */}
                {user?.role === 'admin' && editingPostId !== post._id && (
                  <div className="absolute top-6 left-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(post)} className="bg-zinc-900 hover:bg-zinc-800 text-purple-400 p-2 rounded-lg transition border border-zinc-700" title="ערוך פוסט">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeletePost(post._id)} className="bg-zinc-900 hover:bg-rose-900/30 text-rose-500 p-2 rounded-lg transition border border-zinc-700" title="מחק פוסט">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {editingPostId === post._id ? (
                  /* מצב עריכה (אדמין) מותאם לדארק מוד */
                  <div className="flex flex-col gap-4">
                    <div className="text-rose-400 text-sm font-bold flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4" /> עריכת מנהל מופעלת
                    </div>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      className="text-xl font-bold bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none" 
                    />
                    <textarea 
                      value={editContent} 
                      onChange={(e) => setEditContent(e.target.value)} 
                      rows="4" 
                      className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none" 
                    />
                    <div className="flex gap-3 justify-end mt-4">
                      <button onClick={cancelEditing} className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-5 py-2.5 font-medium transition">
                        <X className="w-4 h-4" /> ביטול
                      </button>
                      <button onClick={() => handleUpdatePost(post._id)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition">
                        <Save className="w-4 h-4" /> שמור שינויים
                      </button>
                    </div>
                  </div>
                ) : (
                  /* תצוגה רגילה */
                  <>
                    <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={getAvatarUrl(post.author?.avatarUrl, post.author?.username)} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-zinc-800" 
                    />
                      <div>
                        <div className="font-bold text-zinc-100">{post.author?.username || 'משתמש לא ידוע'}</div>
                        <div className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString('he-IL')}</div>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-4">{post.title}</h2>
                    <p className="text-zinc-300 whitespace-pre-wrap mb-6 leading-relaxed text-lg">{post.content}</p>
                    {/* === הוספנו את הבלוק הזה להצגת התמונה! === */}
                    {post.imageUrl && (
                      <div className="mt-4 mb-4 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
                        <img 
                          src={post.imageUrl} 
                          alt="תמונת פוסט" 
                          className="w-full h-auto max-h-[400px] object-cover hover:scale-105 transition duration-500" 
                        />
                      </div>
                    )}
                    {/* ======================================= */}
                    {/* תגיות */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="bg-purple-900/30 text-purple-400 border border-purple-500/20 text-xs px-3 py-1.5 rounded-lg font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* כפתור לייק */}
                    <div className="border-t border-zinc-800 pt-6 mt-4">
                      <button 
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 transition font-bold ${post.likes?.includes(user?.id) ? 'text-purple-500' : 'text-zinc-500 hover:text-purple-400'}`}
                      >
                        <Heart className={`w-6 h-6 ${post.likes?.includes(user?.id) ? 'fill-purple-500' : ''}`} />
                        <span>{post.likes?.length || 0}</span> אהבו
                      </button>
                    </div>



                        {/* אזור התגובות */}
              {/* ========================================== */}
              {/* 💬 אזור התגובות מתחיל כאן                  */}
              {/* ========================================== */}
              <div className="mt-6 border-t border-zinc-800 pt-5">
                <h3 className="text-lg font-bold text-white mb-4">תגובות ({post.comments?.length || 0})</h3>
                
                {/* רשימת התגובות הקיימות */}
                <div className="space-y-4 mb-5">
                  {post.comments?.map(comment => (
                    <div key={comment._id} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50">
                      
                      {/* כותרת התגובה (שם ותמונה) */}
                        {/* כותרת התגובה עם כפתור המחיקה */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src={getAvatarUrl(comment.user?.avatarUrl, comment.user?.username)} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
                          <span className="font-bold text-purple-400 text-sm">{comment.user?.username || 'משתמש'}</span>
                        </div>
                        
                        {/* התנאי שמציג את הפח: או שזה המשתמש שלך, או שאתה אדמין */}
                        {/* התנאי המעודכן לפח - בודק את כל סוגי ה-ID האפשריים של המשתמש */}
                        {((user?._id || user?.userId || user?.id) === comment.user?._id || user?.role === 'admin') && (
                          <button 
                            onClick={() => handleDeleteComment(post._id, comment._id)}
                            className="text-zinc-600 hover:text-red-500 transition p-1"
                            title="מחק תגובה"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* תוכן התגובה */}
                      <p className="text-zinc-300 text-sm mb-3 leading-relaxed">{comment.content}</p>
                      
                      {/* כפתור "הגב לתגובה" */}
                      <button 
                        onClick={() => setActiveReplyCommentId(activeReplyCommentId === comment._id ? null : comment._id)}
                        className="text-xs text-zinc-500 hover:text-purple-400 font-bold transition flex items-center gap-1"
                      >
                        ↩️ הגב לתגובה זו
                      </button>

                      {/* טופס תגובה לתגובה (מוסתר כברירת מחדל) */}
                      {activeReplyCommentId === comment._id && (
                        <div className="mt-3 flex gap-2 animate-in fade-in zoom-in duration-200">
                          <input 
                            type="text" 
                            placeholder="כתוב תגובה..." 
                            className="flex-grow bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <button 
                            onClick={() => handleAddReply(post._id, comment._id)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition"
                          >
                            שלח
                          </button>
                        </div>
                      )}

                      {/* ======= תגובות לתגובה (Replies) ======= */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-4 pr-4 md:pr-6 border-r-2 border-purple-500/30 space-y-3">
                          {comment.replies.map(reply => (
                            <div key={reply._id} className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <img src={getAvatarUrl(reply.user?.avatarUrl, reply.user?.username)} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                                <span className="font-bold text-purple-400 text-xs">{reply.user?.username || 'משתמש'}</span>
                              </div>

                            {/* התנאי המעודכן לפח - בודק את כל סוגי ה-ID האפשריים של המשתמש */}
                            {((user?._id || user?.userId || user?.id) === reply.user?._id || user?.role === 'admin') && (
                              <button 
                                onClick={() => handleDeleteReply(post._id, comment._id, reply._id)}
                                className="text-zinc-600 hover:text-red-500 transition p-1"
                                title="מחק תגובה"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            </div>      
                              <p className="text-zinc-400 text-xs">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                    </div>
                  ))}
                </div>

                {/* טופס כתיבת תגובה ראשית חדשה לפוסט */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="הוסף תגובה לפוסט..." 
                    className="flex-grow bg-[#121217] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition placeholder-zinc-600"
                    value={activeCommentPostId === post._id ? commentText : ""}
                    onChange={(e) => {
                      setActiveCommentPostId(post._id);
                      setCommentText(e.target.value);
                    }}
                    onFocus={() => setActiveCommentPostId(post._id)}
                  />
                  {activeCommentPostId === post._id && (
                    <button 
                      onClick={() => handleAddComment(post._id)}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg shadow-purple-600/20"
                    >
                      הגב
                    </button>
                  )}
                </div>
              </div>
              {/* ========================================== */}


                  </>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}