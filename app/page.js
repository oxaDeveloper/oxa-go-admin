"use client";

import StatsCards from "@/components/stats-cards";
import TopProducts from "@/components/top-products";
import { CustomerFulfillment } from "@/components/charts";
import { Clock, User } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { id } = useUser();
  const router = useRouter();

  const today = new Date().toJSON().slice(0, 10).replace(/-/g, " / ");

  useEffect(() => {
    if (id === null) {
      router.push("/login");
    }
  }, [id, router]);

  if (id === null || id === undefined) {
    return null;
  }

  return (
    <>
      <header>
        <title>Oxa Admin | Boshqaruv paneli</title>
      </header>

      <main className="flex-1 p-8">
        <div className="flex justify-end items-center mb-8">
          <div className="text-gray-400 hover:text-white cursor-pointer flex items-center gap-2 duration-200">
            <Clock className="w-6 h-6" />
            <span>{today}</span>
          </div>
        </div>

        <div className="space-y-4">
          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopProducts />
            <CustomerFulfillment />
          </div>
        </div>
      </main>
    </>
  );
}
