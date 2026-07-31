import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "মোহাম্মাদীয়া তাহফীযুল কুরআন মাদ্রাসা ম্যানেজমেন্ট সিস্টেম",
  description: "মাদ্রাসা ব্যবস্থাপনার জন্য আধুনিক ও সহজ ড্যাশবোর্ড",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
