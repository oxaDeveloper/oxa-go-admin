"use client";

import { useState } from "react";
import { UserProvider } from "@/context/UserContext";
import Sidebar from "@/components/sidebar";
import { Menu, X } from "lucide-react";
import "./globals.css";

export default function RootLayout({ children }) {
  const [sidebar, setSidebar] = useState(false);

  return (
    <html lang="en">
      <body className={`bg-gray-900 ${sidebar && "overflow-hidden"}`}>
        <UserProvider>
          <div className="flex min-h-screen">
            <div
              className="absolute top-7 left-7 hidden max-lg:block"
              onClick={() => setSidebar(true)}
            >
              <Menu className="w-8 h-8" color="white" />
            </div>
            {sidebar && (
              <div
                className="absolute top-7 right-7 hidden max-lg:block z-50"
                onClick={() => setSidebar(false)}
              >
                <X className="w-8 h-8" color="white" />
              </div>
            )}
            <div
              className={`max-lg:absolute max-lg:w-full max-lg:bg-black max-lg:bg-opacity-75 z-40 ${
                !sidebar && "max-lg:hidden"
              }`}
            >
              <Sidebar setSidebar={setSidebar} />
            </div>
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
