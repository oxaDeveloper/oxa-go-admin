"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  LinearScale,
} from "chart.js";
import { useUser } from "@/context/UserContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase.config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export function CustomerFulfillment() {
  const { id } = useUser();
  const [monthlyRevenue, setMonthlyRevenue] = useState(Array(12).fill(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const ordersQuery = query(
      collection(db, "orders"),
      where("restaurantId", "==", id)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (querySnapshot) => {
        const monthlyTotals = Array(12).fill(0);

        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          // Convert Firestore Timestamp to JavaScript Date
          const orderDate = orderData.orderedAt?.toDate();
          if (!orderDate) return;

          const monthIndex = orderDate.getMonth();
          const orderPrice = orderData.price || 0;

          monthlyTotals[monthIndex] += orderPrice;
        });

        setMonthlyRevenue(monthlyTotals);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setError("Error fetching order data. Please try again later.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white",
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
        },
      },
    },
  };

  const data = {
    labels: [
      "Yan",
      "Fev",
      "Mar",
      "Apr",
      "May",
      "Iyn",
      "Iyl",
      "Avg",
      "Sen",
      "Okt",
      "Noy",
      "Dek",
    ],
    datasets: [
      {
        fill: true,
        label: "Oylik daromad",
        data: monthlyRevenue,
        borderColor: "rgb(45, 212, 191)",
        backgroundColor: "rgba(45, 212, 191, 0.1)",
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Daromad</h2>
        <p className="text-white">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Daromad</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Daromad</h2>
      <Line options={options} data={data} />
    </div>
  );
}
