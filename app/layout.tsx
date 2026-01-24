import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { SupabaseProvider } from "@/context/SupabaseProvider"; // New provider

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Job Application Tracker - Analytics & Feedback System",
  description: "Track job applications and analyze resume-job matches with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SupabaseProvider>
          <ApplicationProvider>
            {children}
          </ApplicationProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}