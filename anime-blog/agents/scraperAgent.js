const Parser = require('rss-parser');

// הגדרת הפארסר עם "תחפושת" של דפדפן כדי שלא יחסמו אותנו
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1'
  },
  customFields: {
    item: ['media:thumbnail', 'media:content', 'content:encoded', 'description']
  }
});

async function scrapeLatestAnimeNews() {
  try {
    console.log('🤖 סוכן האיסוף הופעל: מתחיל לסרוק 5 ענקיות אנימה...');

    // הכתובות הרשמיות והבטוחות (RSS) של חמשת האתרים שביקשת
    const sitesToScrape = [
      { name: 'Anime News Network', url: 'https://www.animenewsnetwork.com/news/rss.xml' },
      { name: 'MyAnimeList', url: 'https://myanimelist.net/rss/news.xml' },
      { name: 'Crunchyroll News', url: 'https://www.crunchyroll.com/newsrss?lang=enEN' },
      { name: 'Anime Corner', url: 'https://animecorner.me/feed/' },
      { name: 'LiveChart.me', url: 'https://www.livechart.me/feeds/news' }
    ];

    const allNewsItems = [];

    for (const site of sitesToScrape) {
      console.log(`🔍 סורק את האתר: ${site.name}...`);
      try {
        // משיכת המידע המובנה מהערוץ הרשמי
        const feed = await parser.parseURL(site.url);
        
        // ניקח את הכתבה ה-1 הכי חמה מכל אתר כדי לקבל גיוון
        const latestNews = feed.items[0];

        if (latestNews) {
          // כל אתר שומר את התמונה בשדה אחר, אנחנו מחפשים בכל האפשרויות:
          let rawImage = '';
          if (latestNews['media:thumbnail']) {
            rawImage = latestNews['media:thumbnail'].$ ? latestNews['media:thumbnail'].$.url : latestNews['media:thumbnail'];
          } else if (latestNews['media:content']) {
            rawImage = latestNews['media:content'].$ ? latestNews['media:content'].$.url : '';
          } else if (latestNews['content:encoded'] && latestNews['content:encoded'].includes('<img')) {
            const match = latestNews['content:encoded'].match(/src="([^"]+)"/);
            if (match) rawImage = match[1];
          } else if (latestNews.content && latestNews.content.includes('<img')) {
            const match = latestNews.content.match(/src="([^"]+)"/);
            if (match) rawImage = match[1];
          }

          // העברה דרך שרת הפרוקסי כדי שלא יחסמו לנו את התמונה באתר
          const finalImage = rawImage 
            ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}` 
            : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000';

          allNewsItems.push({
            title: latestNews.title,
            summary: latestNews.contentSnippet || latestNews.content || '',
            sourceUrl: latestNews.link,
            coverImage: finalImage,
            sourceName: site.name // שומרים את שם האתר כדי שנדע מאיפה זה בא!
          });
        }
      } catch (siteError) {
        // עוטפים ב-try/catch פנימי כדי שאם אתר אחד למשל משנה הגדרות, זה לא יפיל את השאר
        console.error(`❌ שגיאה בסריקת האתר ${site.name} (ייתכן והקישור השתנה). מדלג הלאה...`);
      }
    }

    console.log(`✅ סוכן האיסוף סיים: נאספו סך הכל ${allNewsItems.length} כתבות מתוך 5 האתרים.`);
    return allNewsItems;

  } catch (error) {
    console.error('❌ שגיאה כללית בסוכן האיסוף:', error.message);
    return [];
  }
}

module.exports = { scrapeLatestAnimeNews };