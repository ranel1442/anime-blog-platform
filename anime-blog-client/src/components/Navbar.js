"use client";
import Link from 'next/link';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, ShieldAlert, Info } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Navbar() {
  const { user, logout, login } = useContext(AuthContext);   
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // הפונקציה שרצה ברגע שגוגל מאשר את המשתמש
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const apiUrl = `${baseUrl}/auth/google`;
      
      const res = await axios.post(apiUrl, {
        credential: credentialResponse.credential
      });
      
      // קסם! שולחים לקונטקסט את המשתמש והטוקן ביחד. האתר יתעדכן מיידית!
      login(res.data.user, res.data.token);
      
    } catch (error) {
      const failedUrl = error.config?.url || 'לא ידוע';
      const errorMessage = error.response?.data?.message || error.message;
      alert(`⚠️ ההתחברות נכשלה!\n\nהכתובת שניסינו לפנות אליה: \n${failedUrl}\n\nהשגיאה מהשרת: \n${errorMessage}`);
    }
  };

  return (
    <nav className="bg-[#121217]/90 backdrop-blur-md border-b border-purple-900/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-3xl font-black tracking-tighter text-white">
              Anime<span className="text-purple-500">Blog</span>
            </span>
          </Link>

          {/* --- תפריט דסקטופ --- */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-zinc-300 hover:text-purple-400 font-medium transition-colors">ראשי</Link>
            <Link href="/community" className="text-zinc-300 hover:text-purple-400 font-medium transition-colors">קהילה</Link>
            <Link href="/contact" className="text-zinc-300 hover:text-purple-400 font-medium transition-colors">צור קשר</Link>
            
            {user?.role === 'admin' && (
              <Link href="/admin" className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-bold bg-purple-900/20 px-4 py-2 rounded-xl border border-purple-500/30 transition-all">
                <ShieldAlert className="w-4 h-4" /> פאנל אדמין
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-purple-400 hover:bg-zinc-900 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-zinc-800">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-purple-500/50" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-zinc-400" />
                  )}
                  <span>{user.username}</span>
                </Link>
                <button onClick={logout} className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4" /> יציאה
                </button>
              </div>
              ) : (
              // אזור ההתחברות בדסקטופ (כולל הכפתור והצהרת הפרטיות מתחתיו)
              <div className="flex flex-col items-center justify-center relative">
                <div className="relative group cursor-pointer mt-3">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative rounded-full overflow-hidden border border-purple-500/30 bg-black flex items-center justify-center">
                    <GoogleLogin 
                      onSuccess={handleGoogleSuccess} 
                      onError={() => console.log('Login Failed')} 
                      theme="filled_black" 
                      shape="pill" 
                    />
                  </div>
                </div>
                {/* הודעת ההסכמה הקטנה והאלגנטית */}
                <span className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1 w-max">
                  <Info className="w-3 h-3" />
                  פרטיך נשמרים לצורך הרשמה לאתר בלבד.
                </span>
              </div>
            )}
          </div>

          {/* כפתור המבורגר למובייל */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-300 hover:text-purple-400 p-2">
              {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- תפריט מובייל נפתח --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1c1c24] border-b border-zinc-900 absolute w-full shadow-2xl z-40 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
            <Link href="/" onClick={closeMenu} className="block text-zinc-300 hover:text-purple-400 hover:bg-zinc-900/50 px-4 py-3 rounded-xl font-medium transition-colors">ראשי</Link>
            <Link href="/community" onClick={closeMenu} className="block text-zinc-300 hover:text-purple-400 hover:bg-zinc-900/50 px-4 py-3 rounded-xl font-medium transition-colors">קהילה</Link>
            <Link href="/contact" onClick={closeMenu} className="block text-zinc-300 hover:text-purple-400 hover:bg-zinc-900/50 px-4 py-3 rounded-xl font-medium transition-colors">צור קשר</Link>
            
            {user?.role === 'admin' && (
              <Link href="/admin" onClick={closeMenu} className="flex items-center gap-2 text-purple-400 font-bold bg-purple-900/20 px-4 py-3 rounded-xl border border-purple-500/30">
                <ShieldAlert className="w-5 h-5" /> פאנל אדמין
              </Link>
            )}

            <div className="h-px bg-zinc-800 my-2"></div>

            {user ? (
              <>
                <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 text-zinc-300 hover:text-purple-400 px-4 py-2 font-medium">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-purple-500/50" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-zinc-400" />
                  )}
                  <span>הפרופיל שלי ({user.username})</span>
                </Link>
                <button onClick={() => { logout(); closeMenu(); }} className="flex items-center gap-2 text-rose-400 hover:text-rose-300 px-4 py-3 w-full text-right font-medium">
                  <LogOut className="w-5 h-5" /> התנתק
                </button>
              </>
                ) : (
              // אזור ההתחברות במובייל
              <div className="flex flex-col items-center mt-2 mb-2">
                <div className="relative group cursor-pointer w-fit mb-3">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative rounded-full overflow-hidden border border-purple-500/30 bg-black flex items-center justify-center">
                    <GoogleLogin 
                      onSuccess={handleGoogleSuccess} 
                      onError={() => console.log('Login Failed')} 
                      theme="filled_black" 
                      shape="pill" 
                    />
                  </div>
                </div>
                {/* הודעת הסכמה מפורטת למובייל */}
                <p className="text-xs text-zinc-500 text-center px-6 leading-relaxed">
                  ההתחברות מהווה הסכמה לשמירת פרטיך הבסיסיים (שם ומייל) לצורך יצירת החשבון וניהולו באתר.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}