import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // ודא שהנתיב תואם לאיפה ששמרת אותו
export const metadata = {
  title: 'Anime Blog',
  description: 'חדשות אנימה וקהילה חמה',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        
        {/* הוספנו את העטיפה הזו של גוגל */}
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <div className="max-w-7xl mx-auto bg-[#121217] min-h-screen border-x border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col">
              <Navbar />
              {children}
            </div>
          </AuthProvider>
        </GoogleOAuthProvider>
        <Footer />
      </body>
    </html>
  );
}