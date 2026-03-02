"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { Loader2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/published`);
        setPosts(res.data);
      } catch (error) {
        console.error("שגיאה במשיכת הפוסטים:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

// 1. קרוסלה: מסננים רק את המסומנים, וממיינים לפי "תאריך הוספה לקרוסלה" (מהחדש לישן)
  const featuredPosts = [...posts]
    .filter(p => p.isFeatured)
    .sort((a, b) => new Date(b.featuredAt || 0) - new Date(a.featuredAt || 0));
  // 2. גריד רגיל: לוקחים את *כל* הפוסטים (גם אלו שבקרוסלה יופיעו למטה כרגיל!)
  const regularPosts = posts;

  const nextSlide = () => setCurrentSlide((prev) => (prev === featuredPosts.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1));

  // טיימר להחלפת שקופיות - שונה ל-10 שניות (10000ms)
  useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 10000); 
    return () => clearInterval(timer);
  }, [featuredPosts.length]);

  if (loading) {
    return <div className="flex-grow flex justify-center items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;
  }

  return (
    <main className="flex-grow py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* קרוסלת עדכונים חמים */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <h2 className="text-4xl font-black text-white uppercase tracking-wider text-center drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                עדכונים חמים
              </h2>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>

            {/* עטיפת הקרוסלה מוגדרת כ-LTR כדי שהחדש יהיה בשמאל והישן בימין */}
            <div className="relative w-full max-w-6xl mx-auto bg-[#1c1c24] border-2 border-purple-600/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] group" dir="ltr">
              
              <div 
                className="flex transition-transform duration-700 ease-out h-auto md:h-[420px]" 
                style={{ transform: `translateX(-${currentSlide * 100}%)` }} // המינוס דואג להחלקה ימינה/שמאלה בצורה חלקה
              >
                {featuredPosts.map((post) => (
                  // התוכן עצמו נשאר ב-RTL כדי שהעברית תישאר מיושרת לימין!
                  <div key={post._id} className="w-full flex-shrink-0 flex flex-col md:flex-row h-full" dir="rtl">
                    
                    {/* אזור הטקסט */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1 relative z-10 bg-gradient-to-l from-[#1c1c24] to-[#121217]">
                      {post.tags && post.tags.length > 0 && (
                        <span className="text-purple-400 text-sm font-bold tracking-widest mb-3 block">
                          {post.tags[0]} • עדכון רשמי
                        </span>
                      )}
                      <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight drop-shadow-md">
                        {post.title}
                      </h3>
                      <p className="text-zinc-400 text-lg line-clamp-3 mb-8 leading-relaxed">
                        {post.content}
                      </p>
                      <Link href={`/post/${post._id}`} className="inline-block bg-white text-black hover:bg-purple-500 hover:text-white px-8 py-3 rounded-full font-black text-lg transition-all shadow-lg shadow-purple-500/20 w-fit">
                        לפוסט המלא »
                      </Link>
                    </div>

                    {/* אזור התמונה */}
                    <div className="w-full md:w-1/2 h-64 md:h-full relative order-1 md:order-2">
                      <img src={post.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000'} alt={post.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1c1c24] via-transparent to-transparent md:block hidden"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c24] via-transparent to-transparent md:hidden block"></div>
                    </div>

                  </div>
                ))}
              </div>

              {/* חצי ניווט מסודרים מחדש: קדימה בימין, אחורה בשמאל */}
              {featuredPosts.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-purple-600 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-zinc-700 hover:border-purple-400 hidden md:block z-20">
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-purple-600 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-zinc-700 hover:border-purple-400 hidden md:block z-20">
                    <ChevronRight className="w-8 h-8" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {featuredPosts.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all rounded-full ${currentSlide === idx ? 'w-8 h-2.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'w-2.5 h-2.5 bg-zinc-600 hover:bg-zinc-400'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* שאר הפוסטים (גריד רגיל) */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white border-b-2 border-zinc-800 pb-2 mb-8 inline-block">כל הכתבות ({regularPosts.length})</h2>
          
          {regularPosts.length === 0 ? (
            <div className="text-center text-zinc-500 py-12 bg-[#1c1c24] rounded-2xl border border-zinc-800">
              אין כתבות נוספות להציג.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}