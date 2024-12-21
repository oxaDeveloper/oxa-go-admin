"use client";

import React, { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const { id } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (id === null) {
      router.push("/login");
    }
  }, [id, router]);

  if (id === null || id === undefined) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full">
      <h1 className="text-2xl text-white">404 - Bu sahifa mavjud emas</h1>
    </div>
  );
}
