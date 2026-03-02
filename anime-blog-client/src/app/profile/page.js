"use client";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, User as UserIcon, Mail, Edit3, Trash2, Save, X, MessageCircle, LayoutDashboard, Settings, Camera } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, token } = useContext(AuthContext);
  const router = useRouter();
  
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // סטייטים לעריכת פוסט מתוך הפרופיל
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // ==========================================
  // ⚙️ סטייטים לעריכת הפרופיל האישי
  // ==========================================
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!token && !user) {
      router.push('/');
      return;
    }

    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/community-posts`);
        const userPosts = res.data.filter(post => 
          post.author?._id === user?.id || post.author === user?.id
        );
        setMyPosts(userPosts);
      } catch (error) {
        console.error("שגיאה במשיכת הפוסטים של המשתמש:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchMyPosts();
    }
  }, [user, token, router]);

  // פונקציה חכמה לבדיקת תמונת פרופיל (מחזירה אות ראשונה אם אין תמונה)
  const getAvatarUrl = (profilePic, username) => {
    if (!profilePic || profilePic.includes('default-avatar.png')) {
      const initial = username ? username.charAt(0).toUpperCase() : 'U';
      return `https://ui-avatars.com/api/?name=${initial}&background=8b5cf6&color=fff&rounded=true`;
    }
    return profilePic;
  };

  // ==========================================
  // פונקציות עריכת הפרופיל האישי
  // ==========================================
  const openProfileModal = () => {
    setNewUsername(user?.username || "");
    setAvatarPreview(user?.avatarUrl || "");
    setAvatarFile(null);
    setShowProfileModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', newUsername);
      if (avatarFile) {
        formData.append('avatarUrl', avatarFile);
      }

      // שליחת העדכון לשרת (הוא מחזיר לנו את המשתמש המעודכן ב- res.data.user)
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // === התיקון כאן: דורסים את המידע הישן בזיכרון של הדפדפן עם המידע החדש! ===
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      // =================================================================

      alert("הפרופיל עודכן בהצלחה! 🎉");
      setShowProfileModal(false);
      window.location.reload(); // עכשיו כשהוא יתרענן, הוא ימשוך את התמונה והשם החדשים!
    } catch (error) {
      console.error("שגיאה בעדכון הפרופיל:", error);
      alert("הייתה בעיה בעדכון הפרופיל. נסה שוב.");
    }
  };

  // ==========================================
  // פונקציות פוסטים
  // ==========================================
  const handleDeletePost = async (postId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הפוסט הזה לתמיד?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/community-posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPosts(myPosts.filter(post => post._id !== postId));
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
      
      setMyPosts(myPosts.map(post => 
        post._id === postId ? { ...post, title: editTitle, content: editContent } : post
      ));
      setEditingPostId(null);
    } catch (error) {
      alert("שגיאה בעדכון הפוסט.");
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;
  if (!user) return null;

  return (
    <main className="flex-grow py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
      
      {/* --- אזור כותרת הפרופיל (Header) --- */}
      <div className="bg-[#1c1c24] rounded-3xl p-8 md:p-10 shadow-2xl border border-zinc-800 mb-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative shrink-0">
          <img 
            src={getAvatarUrl(user.avatarUrl, user.username)} 
            alt={user.username} 
            className="w-32 h-32 rounded-full border-4 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)] object-cover" 
          />
          {user.role === 'admin' && (
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-[#1c1c24] shadow-lg whitespace-nowrap">
               👑 מנהל אתר
             </div>
          )}
        </div>

        <div className="text-center md:text-right relative z-10 w-full">
          <h1 className="text-4xl font-black text-white mb-2">{user.username}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 font-medium mb-4">
            <Mail className="w-4 h-4" /> {user.email}
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
            <Link href="/community" className="bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border border-purple-500/30 px-5 py-2 rounded-xl transition font-bold text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> לקהילה
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 px-5 py-2 rounded-xl transition font-bold text-sm flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> לפאנל ניהול
              </Link>
            )}
            {/* כפתור עריכת הפרופיל החדש */}
            <button 
              onClick={openProfileModal} 
              className="bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 px-5 py-2 rounded-xl transition font-bold text-sm flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> ערוך פרופיל
            </button>
          </div>
        </div>
      </div>

      {/* --- אזור הפוסטים שלי --- */}
      <div>
        <h2 className="text-2xl font-black text-white mb-8 border-b-2 border-purple-600/50 inline-block pb-2">
          הפוסטים שלי בקהילה ({myPosts.length})
        </h2>

        {myPosts.length === 0 ? (
          <div className="bg-[#1c1c24] p-12 rounded-3xl text-center border border-zinc-800">
            <MessageCircle className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-300 mb-2">עדיין לא פרסמת שום דבר!</h3>
            <p className="text-zinc-500 mb-6">הקהילה מחכה לשמוע את דעתך על סדרות האנימה האהובות עליך.</p>
            <Link href="/community" className="inline-flex bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-purple-600/20">
              כתוב פוסט ראשון
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {myPosts.map(post => (
              <div key={post._id} className="bg-[#1c1c24] p-6 md:p-8 rounded-3xl shadow-lg border border-zinc-800 relative group transition-all hover:border-purple-500/30">
                {editingPostId === post._id ? (
                  <div className="flex flex-col gap-5 animate-in fade-in bg-zinc-950/40 p-6 rounded-2xl border border-purple-500/30">
                    <div className="text-purple-400 font-black flex items-center gap-2 mb-2 border-b border-zinc-800 pb-3">
                      <Edit3 className="w-5 h-5" /> עריכת הפוסט שלך
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">כותרת הפוסט</label>
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full text-xl font-bold bg-[#121217] border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-1 focus:ring-purple-500 outline-none placeholder-zinc-600 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">תוכן הפוסט</label>
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="5" className="w-full bg-[#121217] border border-zinc-800 text-zinc-300 rounded-xl px-4 py-3 resize-none outline-none focus:ring-1 focus:ring-purple-500 placeholder-zinc-600 transition" />
                    </div>
                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-zinc-800">
                      <button onClick={cancelEditing} className="px-5 py-2.5 text-zinc-400 hover:text-white font-medium transition flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800">
                        <X className="w-4 h-4" /> ביטול עריכה
                      </button>
                      <button onClick={() => handleUpdatePost(post._id)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20">
                        <Save className="w-5 h-5" /> שמור שינויים
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-white pr-12 md:pr-0">{post.title}</h3>
                      <div className="flex gap-2 absolute top-6 left-6 md:static">
                        <button onClick={() => startEditing(post)} className="bg-[#121217] hover:bg-zinc-800 text-purple-400 p-2.5 rounded-xl transition border border-zinc-800 hover:border-purple-500/30" title="ערוך">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeletePost(post._id)} className="bg-[#121217] hover:bg-rose-900/20 text-rose-500 p-2.5 rounded-xl transition border border-zinc-800 hover:border-rose-500/30" title="מחק">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-lg mb-6">{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="bg-purple-900/30 text-purple-400 border border-purple-500/20 text-xs px-3 py-1.5 rounded-lg font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-zinc-500 font-medium">
                      פורסם ב: {new Date(post.createdAt).toLocaleDateString('he-IL')} • {post.likes?.length || 0} לייקים
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* ⚙️ חלון קופץ (Modal) לעריכת פרופיל          */}
      {/* ========================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1c1c24] border border-zinc-800 rounded-3xl w-full max-w-sm p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 left-5 text-zinc-500 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-black text-white mb-6 text-center">הגדרות פרופיל</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer">
                  <img 
                    src={avatarPreview || getAvatarUrl(user?.avatarUrl, user?.username)} 
                    alt="תצוגה מקדימה" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-zinc-800 group-hover:border-purple-500 transition shadow-lg"
                  />
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <p className="text-zinc-500 text-xs font-medium">לחץ על התמונה כדי להחליף</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">שם משתמש</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#121217] border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition font-medium"
                  placeholder="הקלד שם חדש..."
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl font-black transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> שמור והחל שינויים
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}