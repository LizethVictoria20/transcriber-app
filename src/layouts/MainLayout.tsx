import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  const hideChrome =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900 transition-colors">
      {!hideChrome && <Navbar />}

      <main className={hideChrome ? "flex-1 dark:bg-gray-900" : "flex-1 pt-20 pb-16 dark:bg-gray-900"}>
        {children}
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
}
