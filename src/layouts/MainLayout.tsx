import React from "react";
import Navbar from "../components/Navbar/Navbar";

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
    <>
      <Navbar currentView={currentView} onNavigate={onNavigate} />

      <main className="w-full min-h-screen pt-16">{children}</main>
    </>
  );
}
