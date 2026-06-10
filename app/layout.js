import "./globals.css";
import { Nunito } from 'next/font/google';

// Nhúng Font chữ tròn xoe siêu cute
const nunito = Nunito({ 
  subsets: ['vietnamese'],
  weight: ['400', '600', '700', '800', '900'] 
});

export const metadata = {
  title: "MyStudyPlan - Hồng Dễ Thương 🌸",
  description: "Trợ lý học tập cute nhất hệ mặt trời",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${nunito.className} bg-[#FFF0F5] text-gray-700 antialiased selection:bg-pink-400 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
