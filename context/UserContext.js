"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase.config";
import { doc, getDoc } from "firebase/firestore";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [id, setId] = useState(undefined);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const storedId = localStorage.getItem("userId");
      if (storedId) {
        try {
          const docRef = doc(db, "restaurants", storedId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setId(storedId);
          } else {
            setId(null);
            localStorage.removeItem("userId");
            if (router.pathname !== "/login") {
              router.push("/login");
            }
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          localStorage.removeItem("userId");
          if (router.pathname !== "/login") {
            router.push("/login");
          }
        }
      } else if (router.pathname !== "/login") {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <UserContext.Provider value={{ id, setId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
