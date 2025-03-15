"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Clock, Filter } from "lucide-react";
import Order from "@/components/order";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase.config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrderPage() {
  const { id } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [prevOrdersCount, setPrevOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("wait");
  const [error, setError] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const today = new Date().toJSON().slice(0, 10).replace(/-/g, " / ");

  useEffect(() => {
    if (id === null) {
      router.push("/login");
      return;
    }

    if (id === undefined) {
      setLoading(true);
      return;
    }

    const ordersQuery = query(
      collection(db, "orders"),
      where("restaurantId", "==", id),
      orderBy("status"),
      orderBy("orderedAt", "asc")
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((order) => order.status !== "delivered");

        if (ordersData.length > prevOrdersCount && audioEnabled) {
          const audio = new Audio("/sound/new_order.mp3");
          audio.play().catch((error) => console.log("Audio play blocked:", error));
        }
        setPrevOrdersCount(ordersData.length);

        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders: ", err);
        setError("Error fetching orders. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, router, prevOrdersCount, audioEnabled]);

  // Enable sound after user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setAudioEnabled(true);
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    return () => document.removeEventListener("click", handleUserInteraction);
  }, []);

  if (id === null || id === undefined) {
    return <div className="flex-1 p-8 text-white">Loading user data...</div>;
  }

  if (loading) {
    return <div className="flex-1 p-8 text-white">Loading orders...</div>;
  }

  if (error) {
    return <div className="flex-1 p-8 text-red-500">{error}</div>;
  }

  return (
    <>
      <header>
        <title>Oxa Admin | Buyurtmalar</title>
      </header>

      <main className="flex-1 px-8 py-[22px]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-1 rounded-lg cursor-pointer max-lg:ml-12">
            <Filter className="w-5 h-5" color="white" />
            <Select onValueChange={setFilter} value={filter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-transparent outline-none text-white border-none text-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700 text-lg outline-none">
                <SelectItem value="wait">Kutilmoqda</SelectItem>
                <SelectItem value="cooking">Tayyorlanmoqda</SelectItem>
                <SelectItem value="courier">Kuryer</SelectItem>
                <SelectItem value="done">Tayyor (Saboy)</SelectItem>
                <SelectItem value="delivering">Yetkazilmoqda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-gray-400 hover:text-white cursor-pointer items-center gap-2 duration-200 sm:flex hidden">
            <Clock className="w-6 h-6" />
            <span>{today}</span>
          </div>
        </div>

        <div>
          <div className="lg:flex items-center justify-between bg-gray-800 px-6 py-4 rounded-lg hidden">
            <h1 className="text-lg text-white lg:min-w-16 min-w-8 text-center">
              No
            </h1>

            <div className="flex items-center gap-20 2xl:gap-36">
              <h1 className="text-lg text-white lg:min-w-32 text-center">
                Mijoz
              </h1>
              <h2 className="text-lg text-white lg:min-w-32 text-center">
                Narx
              </h2>
              <h2 className="text-lg text-white lg:min-w-32 text-center">
                Vaqti
              </h2>
              <h3 className="text-lg text-white lg:min-w-32 text-center">
                Holati
              </h3>
            </div>

            <div className="min-w-9" />
          </div>

          <div className="border-b my-5 w-full" />

          <div className="flex flex-col gap-5">
            {orders.map(
              (order) =>
                order.status === filter && (
                  <Order key={order.id} order={order} />
                )
            )}
          </div>
        </div>
      </main>
    </>
  );
}
