import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoftSkills Pro — Платформа оценки и развития",
  description: "Оценка soft skills и персональные планы развития на основе ИИ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
