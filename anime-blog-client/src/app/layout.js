import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Pwa from '@/components/Pwa'; // ייבוא רכיב ה-PWA

// הגדרת צבע הנושא לאפליקציה בטלפון (מתאים לרקע הכהה של הבלוג)
export const viewport = {
  themeColor: '#121217',
};

export const metadata = {
  title: 'Anime Blog',
  description: 'חדשות אנימה וקהילה חמה',
  // אפשר להשאיר את זה, אבל התגית למטה היא מה שבאמת תעשה את העבודה
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      {/* הוספנו את תגית ה-head הזו כדי להכריח את הטעינה של ה-manifest */}
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body suppressHydrationWarning>

        {/* הרכיב שרושם את ה-Service Worker כדי לאפשר התקנה */}
        <Pwa />

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