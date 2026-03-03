"use client";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';
import { CheckCircle, XCircle, Loader2, Eye, Edit3, Save, X, Bot, Image as ImageIcon, PlusCircle, LayoutList, CheckSquare, Star, Wand2, Video, Copy, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { user, token } = useContext(AuthContext);
  const router = useRouter();

  const [pendingPosts, setPendingPosts] = useState([]);
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'published' | 'reels'
  const [previewPost, setPreviewPost] = useState(null);
  const [isAgentsRunning, setIsAgentsRunning] = useState(false);
  
  const [presenterImages, setPresenterImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('maya_base.jpg');
  const [uploadFile, setUploadFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // סטייט חדש לעקוב אחרי יצירת רילסים
  const [generatingReels, setGeneratingReels] = useState({});

  // סטייטים ליצירת פוסט ידני
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCoverImage, setNewCoverImage] = useState("");
  const [newTags, setNewTags] = useState("");

  // סטייטים לעריכה
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editTags, setEditTags] = useState("");
  
  useEffect(() => {
    if (!token && !user) { setLoading(false); return; }
    if (user && user.role !== 'admin') { router.push('/'); return; }

    const fetchAllPosts = async () => {
      try {
        const [pendingRes, publishedRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/pending`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/published`)
        ]);
        setPendingPosts(pendingRes.data);
        setPublishedPosts(publishedRes.data);
      } catch (error) {
        console.error("שגיאה במשיכת פוסטים:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAllPosts();
  }, [user, token, router]);

  // פונקציה למשיכת התמונות הקיימות בשרת
  const fetchImages = async () => {
      try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/presenters`, {
              headers: { Authorization: `Bearer ${token}` } // ודא שיש לך פה את הטוקן
          });
          if (res.data.images) {
              setPresenterImages(res.data.images);
          }
      } catch (error) {
          console.error("שגיאה במשיכת תמונות הפרזנטורית:", error);
      }
  };

    // קריאה לפונקציה כשהעמוד נטען
  // קורא לפונקציה רק כשהטוקן קיים!
  useEffect(() => {
      if (token) {
          fetchImages();
      }
  }, [token]); // המערך הזה אומר ל-React: "תריץ את זה שוב ברגע שהטוקן נטען"


  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return alert("חובה למלא כותרת ותוכן!");
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(t => t !== "");

    try {
      const createRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts`, 
        { title: newTitle, content: newContent, coverImage: newCoverImage, tags: tagsArray, authorAgent: 'Admin (Manual)' }
      );
      const newPostId = createRes.data.post._id;

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${newPostId}/status`,
        { status: 'published' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPublishedPosts([{ ...createRes.data.post, status: 'published' }, ...publishedPosts]);
      setNewTitle(""); setNewContent(""); setNewCoverImage(""); setNewTags("");
      setShowCreateForm(false);
      setActiveTab('published');
    } catch (error) {
      alert("שגיאה ביצירת הפוסט.");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (activeTab === 'pending') {
        const postToMove = pendingPosts.find(p => p._id === id);
        setPendingPosts(prev => prev.filter(p => p._id !== id));
        if (newStatus === 'published' && postToMove) setPublishedPosts([{...postToMove, status: 'published'}, ...publishedPosts]);
      } else {
        setPublishedPosts(prev => prev.filter(p => p._id !== id));
      }
      setPreviewPost(null);
    } catch (error) {
      alert('שגיאה בעדכון הסטטוס.');
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCoverImage(post.coverImage || "");
    setEditTags(post.tags ? post.tags.join(', ') : "");
  };

  const handleUpdatePost = async (id) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`,
        { title: editTitle, content: editContent, coverImage: editCoverImage, tags: editTags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedTagsArray = editTags.split(',').map(tag => tag.trim()).filter(t => t !== "");

      const updateFn = posts => posts.map(p => p._id === id ? { ...p, title: editTitle, content: editContent, coverImage: editCoverImage, tags: updatedTagsArray } : p);
      setPendingPosts(updateFn);
      setPublishedPosts(updateFn);
      setEditingPostId(null);
    } catch (error) {
      alert("שגיאה בשמירת השינויים.");
    }
  };

  const handleToggleFeature = async (post) => {
      try {
        const updatedStatus = !post.isFeatured;
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}/feature`,
          { isFeatured: updatedStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setPublishedPosts(publishedPosts.map(p => 
          p._id === post._id ? { ...p, isFeatured: updatedStatus } : p
        ));
      } catch (error) {
        console.error("שגיאת קרוסלה מלאה:", error.response?.data || error.message);
        alert("שגיאה בהוספה/הסרה מהקרוסלה. בדוק את הקונסול (F12).");
      }
    };

  const handleRunAgents = async () => {
    try {
      setIsAgentsRunning(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/run-agents`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🤖 הסוכנים הופעלו בהצלחה!\nהם עובדים עכשיו ברקע. זה עשוי לקחת כמה דקות עד שיופיעו פוסטים חדשים תחת 'ממתינים לאישור'.");
    } catch (error) {
      console.error("שגיאה בהפעלת הסוכנים:", error);
      alert("הייתה בעיה בהפעלת הסוכנים.");
    } finally {
      setTimeout(() => setIsAgentsRunning(false), 2000); 
    }
  };

  // --- הפונקציה החדשה ליצירת סרטון רילס ---
  const handleGenerateReel = async (post) => {
    try {
      setGeneratingReels(prev => ({ ...prev, [post._id]: true }));
      alert("🎬 מתחיל לייצר רילס! זה עשוי לקחת כמה דקות (הוידאו נוצר בשרת מרוחק). אפשר להמשיך לעבוד על הפאנל בינתיים.");

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}/generate-reel`, 
        { presenterImage: selectedImage }, 
        { headers: { Authorization: `Bearer ${token}` } }
        );


      // עדכון הסטייט המקומי כדי שהרילס יופיע מיד בלשונית בלי צורך לרענן
      const updateFn = posts => posts.map(p => 
        p._id === post._id ? { ...p, reelVideoUrl: res.data.reelVideoUrl, reelCaption: res.data.reelCaption } : p
      );
      setPendingPosts(updateFn);
      setPublishedPosts(updateFn);

      alert("✨ הרילס מוכן! עבור ללשונית 'רילסים מוכנים' כדי לראות אותו.");
    } catch (error) {
      console.error("שגיאה ביצירת רילס:", error);
      alert("הייתה בעיה ביצירת הרילס. בדוק את השרת.");
    } finally {
      setGeneratingReels(prev => ({ ...prev, [post._id]: false }));
    }
  };


  // פונקציה שמפעילה את ההורדה
  const handleDownloadFile = (postId, type) => {
      // פותח חלונית הורדה ישירות מהשרת (type יכול להיות 'video' או 'audio')
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/download-reel?type=${type}`, '_blank');
  };

  // פונקציה שמוחקת את הרילס
  const handleDeleteReel = async (postId) => {
      const isSure = window.confirm("האם אתה בטוח שברצונך למחוק את הוידאו והאודיו מהשרת? פעולה זו תפנה מקום ולא ניתנת לביטול.");
      if (!isSure) return;

      try {
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/delete-reel`, {
              headers: { Authorization: `Bearer ${token}` } // ודא שהטוקן מוגדר אצלך
          });
          
          alert("הקבצים נמחקו בהצלחה מהשרת!");
          // פה כדאי להוסיף רענון קל לעמוד או לעדכן את ה-State כדי שהוידאו ייעלם מהמסך
          
      } catch (error) {
          console.error("Error deleting files", error);
          alert("אירעה שגיאה במחיקת הקבצים.");
      }
  };

  // פונקציה להעלאת תמונה חדשה
  const handleUploadImage = async () => {
      if (!uploadFile) return alert("נא לבחור קובץ תמונה קודם!");

      const formData = new FormData();
      formData.append('image', uploadFile);

      try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/upload-presenter`, formData, {
              headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
              }
          });
          alert("התמונה הועלתה בהצלחה!");
          setUploadFile(null); // מנקה את שדה הבחירה
          fetchImages(); // מרענן את רשימת התמונות כדי שהחדשה תופיע מיד!
      } catch (error) {
          console.error("שגיאה בהעלאת התמונה:", error);
          alert("אירעה שגיאה בהעלאת התמונה.");
      }
  };










  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;
  if (!user || user.role !== 'admin') return <div className="min-h-screen flex items-center justify-center text-rose-500 font-bold text-2xl">אין הרשאה.</div>;

  // סינון הפוסטים שיש להם רילס מוכן
  const reelsPosts = [...pendingPosts, ...publishedPosts].filter(p => p.reelVideoUrl);
  const currentPosts = activeTab === 'pending' ? pendingPosts : activeTab === 'published' ? publishedPosts : reelsPosts;

return (
    <main className="flex-grow py-12 px-4 md:px-8 relative">
      <div className="max-w-5xl mx-auto">
        
        {/* כותרת וכפתורי יצירה */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
              פאנל <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">בקרה למנהל</span>
            </h1>
            <p className="text-zinc-400">ניהול, אישור ועריכת תוכן במערכת.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleRunAgents}
              disabled={isAgentsRunning}
              className={`bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 font-bold ${isAgentsRunning ? 'opacity-70 cursor-wait' : ''}`}
            >
              <Bot className={`w-5 h-5 ${isAgentsRunning ? 'animate-pulse' : ''}`} />
              {isAgentsRunning ? 'שולח פקודה...' : 'הפעל סוכנים (AI) עכשיו'}
            </button>

            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 font-bold"
            >
              {showCreateForm ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              {showCreateForm ? 'ביטול יצירה' : 'כתבה רשמית ידנית'}
            </button>
          </div>

        </div>
          
              {/* אזור ניהול פרזנטורית */}
{/* אזור ניהול פרזנטורית (מעוצב מחדש ל-Dark Mode) */}
    <div className="mb-5 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <h4 className="font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <span className="text-lg">👩‍💼</span> ניהול פרזנטורית (מאיה)
        </h4>
        
        {/* שינינו פה ל-items-center כדי שהתמונה תשב יפה באמצע מול השדות */}
        <div className="flex flex-col md:flex-row gap-5 items-center">
            
            {/* --- התצוגה המקדימה החדשה! --- */}
            {selectedImage && (
                <div className="shrink-0 relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md group-hover:bg-emerald-500/40 transition-all duration-300"></div>
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')}/temp_reels/${selectedImage}`}
                        alt="Maya Preview" 
                        onClick={() => setShowImageModal(true)}
                        className="relative w-16 h-16 object-cover rounded-full border-2 border-emerald-500/50 shadow-lg z-10 cursor-pointer transition-transform hover:scale-105 hover:border-emerald-400"
                        title="לחץ להגדלה"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                      />
                </div>
            )}

            {/* בחירת תמונה קיימת */}
            <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">בחר תמונה לרילס:</label>
                <select 
                    value={selectedImage}
                    onChange={(e) => setSelectedImage(e.target.value)}
                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                >
                    {presenterImages.map((img, idx) => (
                        <option key={idx} value={img}>{img}</option>
                    ))}
                </select>
            </div>

            {/* העלאת תמונה חדשה */}
            <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">העלה תמונה חדשה:</label>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        accept="image/jpeg, image/png"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="w-full text-sm text-zinc-400 file:mr-0 file:ml-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 transition-colors bg-zinc-900/80 border border-zinc-700 rounded-lg cursor-pointer"
                    />
                    <button 
                        onClick={handleUploadImage}
                        className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-lg hover:bg-emerald-500/30 transition font-bold text-sm whitespace-nowrap"
                    >
                        העלה
                    </button>
                </div>
            </div>
        </div>
    </div>


        {/* טופס יצירת פוסט ידני */}
        {showCreateForm && (
          <form onSubmit={handleCreatePost} className="bg-[#1c1c24] p-8 rounded-3xl shadow-2xl border border-purple-500/30 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-2xl font-black mb-6 text-white flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-purple-500"/> כתיבת כתבה חדשה (תפורסם מיידית)
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">כותרת הכתבה</label>
                <input type="text" placeholder="הכנס כותרת מושכת..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition placeholder-zinc-600" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> קישור לתמונה (URL)</label>
                <input type="text" placeholder="https://example.com/image.jpg" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition text-left dir-ltr placeholder-zinc-600" value={newCoverImage} onChange={(e) => setNewCoverImage(e.target.value)} />
                {newCoverImage && <img src={newCoverImage} alt="Preview" className="h-40 w-full md:w-80 object-cover rounded-xl border border-zinc-800 mt-3 shadow-lg" onError={(e) => e.target.style.display='none'} />}
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">תוכן הכתבה</label>
                <textarea placeholder="כתוב את תוכן הכתבה..." rows="6" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition resize-none placeholder-zinc-600" value={newContent} onChange={(e) => setNewContent(e.target.value)}></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">תגיות (מופרדות בפסיקים)</label>
                <input type="text" placeholder="אנימה, עדכון, נטפליקס" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition placeholder-zinc-600" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 mt-4">
                פרסם לאתר עכשיו
              </button>
            </div>
          </form>
        )}

        {/* לשוניות ניווט */}
        <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold text-lg transition-colors border-b-4 whitespace-nowrap ${activeTab === 'pending' ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutList className="w-5 h-5" /> ממתינים לאישור ({pendingPosts.length})
          </button>
          <button 
            onClick={() => setActiveTab('published')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold text-lg transition-colors border-b-4 whitespace-nowrap ${activeTab === 'published' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            <CheckSquare className="w-5 h-5" /> באוויר ({publishedPosts.length})
          </button>
          <button 
            onClick={() => setActiveTab('reels')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold text-lg transition-colors border-b-4 whitespace-nowrap ${activeTab === 'reels' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            <Video className="w-5 h-5" /> רילסים מוכנים ({reelsPosts.length})
          </button>
        </div>
        
        {/* רשימת הפוסטים */}
        {currentPosts.length === 0 ? (
          <div className="bg-[#1c1c24] p-12 rounded-3xl shadow-lg text-center border border-zinc-800">
            <p className="text-xl text-zinc-500 font-medium">אין תוכן להציג בלשונית זו כרגע.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {currentPosts.map(post => (
              <div key={post._id} className="bg-[#1c1c24] p-6 rounded-3xl shadow-lg border border-zinc-800 hover:border-purple-500/30 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden transition-all">
                
                {activeTab === 'published' && <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">לייב באתר</div>}
                {activeTab === 'pending' && <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ממתין</div>}
                {activeTab === 'reels' && <div className="absolute top-0 right-0 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">רילס מוכן</div>}

                {activeTab === 'reels' ? (
                   <div className="w-full md:w-56 flex flex-col gap-2">
                    <video src={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/${post.reelVideoUrl.split('temp_reels\\')[1] || post.reelVideoUrl.split('temp_reels/')[1] || post.reelVideoUrl}`} controls className="w-full h-auto rounded-xl border border-zinc-700 bg-black"></video>                   </div>
                ) : (
                  post.coverImage && !editingPostId && (
                    <img src={post.coverImage} alt={post.title} className="w-full md:w-56 h-40 object-cover rounded-2xl border border-zinc-800 shadow-md" />
                  )
                )}
                
                <div className="flex-grow w-full mt-2">
                  {editingPostId === post._id ? (
                    <div className="flex flex-col gap-4 w-full bg-zinc-950/50 p-6 rounded-2xl border border-purple-500/30">
                      <div className="text-purple-400 text-sm font-bold flex items-center gap-2 mb-2"><Edit3 className="w-4 h-4"/> עריכת פוסט מנהל</div>
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-xl font-bold bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none" />
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-zinc-400">קישור תמונה</label>
                        <input type="text" value={editCoverImage} onChange={(e) => setEditCoverImage(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-4 py-3 dir-ltr text-left outline-none focus:ring-2 focus:ring-purple-500" />
                        {editCoverImage && <img src={editCoverImage} className="h-32 w-64 object-cover rounded-xl border border-zinc-700 mt-2" onError={(e)=>e.target.style.display='none'}/>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-zinc-400">תגיות (מופרדות בפסיקים)</label>
                        <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="אנימה, וואן פיס, חדשות..." className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>

                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="5" className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-purple-500" />
                      
                      <div className="flex gap-3 justify-end mt-2">
                        <button onClick={() => setEditingPostId(null)} className="px-5 py-2.5 text-zinc-400 hover:text-white font-medium transition">ביטול</button>
                        <button onClick={() => handleUpdatePost(post._id)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition">שמור שינויים</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-black text-white mb-2">{post.title}</h2>
                      
                      {activeTab === 'reels' ? (
                         <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-6">
                           <p className="text-sm font-bold text-cyan-400 mb-2">כיתוב מוכן לטיקטוק/אינסטגרם:</p>
                           <p className="text-zinc-300 whitespace-pre-wrap">{post.reelCaption}</p>
                         </div>
                      ) : (
                        <>
                          {post.sourceUrl && (
                            <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mb-3 text-sm font-bold text-purple-400 hover:text-purple-300 transition">
                              🔗 צפה במקור (אנגלית)
                            </a>
                          )}
                          <p className="text-zinc-400 mb-6 line-clamp-2 text-base leading-relaxed">{post.content}</p>
                        </>
                      )}
                      
                      {/* כפתורי הפעולה */}
                      <div className="flex flex-wrap gap-3">
                        {activeTab === 'reels' ? (
                          <>
                          <div className="flex gap-4 mt-4">
                            <button onClick={() => { navigator.clipboard.writeText(post.reelCaption); alert("הכיתוב הועתק!"); }} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-xl hover:bg-zinc-700 transition font-bold text-sm">
                              <Copy className="w-4 h-4" /> העתק כיתוב
                            </button>
                            <button 
                              onClick={() => handleDownloadFile(post._id, 'video')}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                          >
                              💾 הורד סרטון (MP4)
                          </button>

                          <button 
                              onClick={() => handleDownloadFile(post._id, 'audio')}
                              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                          >
                              🎵 הורד אודיו (MP3)
                          </button>

                          <button 
                              onClick={() => handleDeleteReel(post._id)}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          >
                              🗑️ מחק מהשרת
                          </button>
                      </div>
                          </>
                        ) : (
                          <>


                                  {/* שורת הכפתורים התחתונה - מסודרת בשורה אחת זורמת */}
                                  <div className="flex flex-wrap items-center gap-3 mt-4">
                                      
                                      {activeTab === 'pending' && (
                                          <button onClick={() => handleStatusUpdate(post._id, 'published')} className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl hover:bg-emerald-500/30 transition font-bold text-sm">
                                              <CheckCircle className="w-4 h-4" /> אשר ופרסם
                                          </button>
                                      )}

                                      {!post.reelVideoUrl ? (
                                          <button onClick={() => handleGenerateReel(post)} disabled={generatingReels[post._id]} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold text-sm border ${generatingReels[post._id] ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed' : 'bg-cyan-900/30 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/50'}`}>
                                              {generatingReels[post._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />} 
                                              {generatingReels[post._id] ? 'מייצר רילס...' : 'צור רילס (AI)'}
                                          </button>
                                      ) : (
                                          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-500 font-bold text-sm bg-zinc-900/50">
                                              <CheckCircle className="w-4 h-4 text-emerald-500/50" /> רילס מוכן
                                          </span>
                                      )}

                                      <button onClick={() => setPreviewPost(post)} className="flex items-center gap-1.5 bg-purple-900/30 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-xl hover:bg-purple-900/50 transition font-bold text-sm">
                                          <Eye className="w-4 h-4" /> תצוגה
                                      </button>
                                      
                                      <button onClick={() => startEditing(post)} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-xl hover:bg-zinc-700 transition font-bold text-sm">
                                          <Edit3 className="w-4 h-4" /> ערוך
                                      </button>

                                      {activeTab === 'published' && (
                                          <button onClick={() => handleToggleFeature(post)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold text-sm border ${post.isFeatured ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
                                              <Star className={`w-4 h-4 ${post.isFeatured ? 'fill-amber-400' : ''}`} /> 
                                              {post.isFeatured ? 'מוצג בקרוסלה' : 'הוסף לקרוסלה'}
                                          </button>
                                      )}

                                      {post.imagePrompt && (
                                          <button onClick={() => { navigator.clipboard.writeText(post.imagePrompt); alert("✨ הפרומפט הועתק בהצלחה ללוח! ✨\n\n" + post.imagePrompt); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold text-sm border bg-indigo-900/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30" title="צפה והעתק את הפרומפט">
                                              <Wand2 className="w-4 h-4" /> פרומפט תמונה
                                          </button>
                                      )}

                                      {/* כפתור המחיקה זז לסוף השורה מצד שמאל (ml-auto) */}
                                      <button onClick={() => handleStatusUpdate(post._id, 'rejected')} className="flex items-center gap-1.5 bg-rose-900/30 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-900/50 transition font-bold text-sm ml-auto">
                                          <XCircle className="w-4 h-4" /> {activeTab === 'published' ? 'מחק מהאתר' : 'דחה ומחק'}
                                      </button>

                                  </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* תצוגה מקדימה מלאה (Modal) */}
      {previewPost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#1c1c24] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh] border border-zinc-800">
            
            <button onClick={() => setPreviewPost(null)} className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-20 backdrop-blur-md border border-zinc-700">
              <X className="w-6 h-6" />
            </button>

            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {previewPost.coverImage && (
                <div className="relative border-b border-zinc-800">
                  <img src={previewPost.coverImage} alt={previewPost.title} className="w-full h-64 md:h-[400px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c24] via-transparent to-transparent opacity-90"></div>
                </div>
              )}
              
              <div className="p-8 md:p-12 relative z-10 -mt-10 md:-mt-16">
                <div className="flex flex-wrap gap-2 mb-6">
                  {previewPost.tags?.map((tag, idx) => (
                    <span key={idx} className="bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-md">{previewPost.title}</h1>
                
                {previewPost.sourceUrl && (
                  <a href={previewPost.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mb-8 text-sm font-bold text-purple-400 hover:text-purple-300 transition">
                    🔗 מקור הכתבה באנגלית (לבדיקה)
                  </a>
                )}

                <p className="text-lg text-zinc-300 leading-relaxed whitespace-pre-wrap">{previewPost.content}</p>
              </div>
            </div>

            <div className="bg-zinc-950 border-t border-zinc-800 p-4 md:px-8 flex items-center justify-between mt-auto">
              <span className="text-zinc-500 font-bold text-sm">
                {activeTab === 'pending' ? 'הפוסט ממתין לאישור מנהל' : 'הפוסט כבר באוויר'}
              </span>
              <div className="flex gap-3">
                <button onClick={() => handleStatusUpdate(previewPost._id, 'rejected')} className="px-5 py-2.5 rounded-xl font-bold text-rose-400 hover:bg-rose-900/30 transition border border-transparent hover:border-rose-500/30">
                  {activeTab === 'published' ? 'מחק מהאתר' : 'דחה ומחק'}
                </button>
                {activeTab === 'pending' && (
                  <button onClick={() => handleStatusUpdate(previewPost._id, 'published')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-600/20">
                    <CheckCircle className="w-5 h-5" /> פרסם לאתר עכשיו
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}



    {/* פופ-אפ (Modal) להצגת התמונה בגדול */}
        {showImageModal && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setShowImageModal(false)} // סוגר בלחיצה על הרקע
            >
                <div 
                    className="relative max-w-2xl w-full bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-2"
                    onClick={(e) => e.stopPropagation()} // מונע סגירה אם לוחצים על התמונה עצמה
                >
                    {/* כפתור סגירה (X) */}
                    <button 
                        onClick={() => setShowImageModal(false)}
                        className="absolute -top-4 -right-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-2 shadow-lg transition-colors z-10"
                        title="סגור"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>

                    {/* התמונה הגדולה */}
                    <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')}/temp_reels/${selectedImage}`}
                        alt="Maya Full Size"
                        className="w-full max-h-[80vh] object-contain rounded-xl"
                    />
                </div>
            </div>
        )}



    </main>
  );
}