import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://crime-rate-analysis.vercel.app/'),
  title: "AI Crime Rate Analysis | Natural Language Crime Statistics",
  description: "Transform natural language questions into crime data insights. Ask questions in Hebrew about crime statistics and get instant, AI-powered analysis from comprehensive databases. Built by Kobi Krasnoff using Next.js, Ollama AI, and modern data visualization.",
  keywords: "crime statistics, AI analysis, natural language processing, Hebrew queries, data visualization, crime data, SQL generation, Ollama, Next.js, Kobi Krasnoff, Israel crime rates, public safety analytics, law enforcement data, ניתוח פשיעה, סטטיסטיקות פשיעה, בינה מלאכותית, עיבוד שפה טבעית, ישראל, ביטחון ציבורי, נתוני משטרה, ניתוח נתונים, שאילתות SQL, ויזואליזציה, קובי קרסנוף, מערכת ניתוח, פשיעה אלימה, פשיעה כלכלית, רכוש, בטיחות, ערים, אזורים",
  authors: {name: "Kobi Krasnoff"},
  openGraph: {
    type: "website",
    title: "AI-Powered Crime Rate Analysis System",
    description: "Ask questions about crime data in natural language and get instant insights. Advanced AI converts Hebrew queries into comprehensive crime statistics analysis.",
    images: "https://krasnoff-personal-web-app.vercel.app/img/crime-rate-analysis.png",
    url: "https://crime-rate-analysis.vercel.app/"
  },
  twitter: {
    card: "summary_large_image",
    site: "https://crime-rate-analysis.vercel.app/",
    creator: "@krasnoffkobi",
    title: "AI Crime Analysis Tool | Natural Language Crime Data Queries",
    description: "Revolutionary crime statistics analysis tool. Ask questions in Hebrew, get AI-powered insights from comprehensive crime databases. Built with cutting-edge technology.",
    images: "https://krasnoff-personal-web-app.vercel.app/img/crime-rate-analysis.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
