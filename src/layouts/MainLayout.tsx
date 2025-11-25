import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function MainLayout({
  children,
  currentView,
  onNavigate,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#111827] transition-colors">
      <Navbar currentView={currentView} onNavigate={onNavigate} />

      <main className="flex-1 pt-20 pb-16">{children}</main>
      <Footer />
    </div>
  );
}
