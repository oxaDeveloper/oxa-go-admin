import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { DollarSignIcon, FileCheck2, Package, ShoppingBag } from "lucide-react";
import { db } from "@/firebase.config";
import { useUser } from "@/context/UserContext";

export default function StatsCards() {
  const { id } = useUser();

  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribes = [];

    const fetchStats = () => {
      setLoading(true);
      setError(null);

      // Restaurant document listener
      const restaurantUnsubscribe = onSnapshot(
        doc(db, "restaurants", id),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const restaurantData = docSnapshot.data();
            setStats((prevStats) => [
              ...prevStats.filter((stat) => stat.id !== "1"),
              { id: "1", value: restaurantData.menu?.length || 0 },
            ]);
          }
        },
        (error) => {
          console.error("Error fetching restaurant data:", error);
          setError("Error fetching restaurant data. Please try again later.");
        }
      );
      unsubscribes.push(restaurantUnsubscribe);

      // Completed orders listener
      const completedOrdersQuery = query(
        collection(db, "orders"),
        where("restaurantId", "==", id),
        where("status", "==", "delivered")
      );
      const completedOrdersUnsubscribe = onSnapshot(
        completedOrdersQuery,
        (querySnapshot) => {
          setStats((prevStats) => [
            ...prevStats.filter((stat) => stat.id !== "2"),
            { id: "2", value: querySnapshot.size },
          ]);
        },
        (error) => {
          console.error("Error fetching completed orders:", error);
          setError("Error fetching completed orders. Please try again later.");
        }
      );
      unsubscribes.push(completedOrdersUnsubscribe);

      // Active orders listener
      const activeOrdersQuery = query(
        collection(db, "orders"),
        where("restaurantId", "==", id),
        where("status", "!=", "delivered")
      );
      const activeOrdersUnsubscribe = onSnapshot(
        activeOrdersQuery,
        (querySnapshot) => {
          setStats((prevStats) => [
            ...prevStats.filter((stat) => stat.id !== "3"),
            { id: "3", value: querySnapshot.size },
          ]);
        },
        (error) => {
          console.error("Error fetching active orders:", error);
          setError("Error fetching active orders. Please try again later.");
        }
      );
      unsubscribes.push(activeOrdersUnsubscribe);

      // Total revenue listener
      const totalRevenueQuery = query(
        collection(db, "orders"),
        where("restaurantId", "==", id),
        where("status", "==", "delivered")
      );
      const totalRevenueUnsubscribe = onSnapshot(
        totalRevenueQuery,
        (querySnapshot) => {
          const totalRevenue = querySnapshot.docs.reduce((total, doc) => {
            const orderData = doc.data();
            return total + (orderData.price || 0);
          }, 0);
          setStats((prevStats) => [
            ...prevStats.filter((stat) => stat.id !== "4"),
            { id: "4", value: totalRevenue },
          ]);
        },
        (error) => {
          console.error("Error fetching total revenue:", error);
          setError("Error fetching total revenue. Please try again later.");
        }
      );
      unsubscribes.push(totalRevenueUnsubscribe);

      setLoading(false);
    };

    fetchStats();

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [id]);

  const getIcon = (index) => {
    switch (index) {
      case 0:
        return Package;
      case 1:
        return FileCheck2;
      case 2:
        return ShoppingBag;
      default:
        return DollarSignIcon;
    }
  };

  const getTitle = (index) => {
    switch (index) {
      case 0:
        return "Turdagi mahsulotlar";
      case 1:
        return "Bajarilgan buyurtmalar";
      case 2:
        return "Faol buyurtmalar";
      default:
        return "Daromad";
    }
  };

  const getColor = (index) => {
    switch (index) {
      case 0:
        return "orange";
      case 1:
        return "blue";
      case 2:
        return "purple";
      default:
        return "teal";
    }
  };

  if (loading) {
    return <div className="text-white">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats
        .sort((a, b) => a.id - b.id)
        .map((data, idx) => {
          const Icon = getIcon(idx);
          const color = getColor(idx);

          return (
            <div key={data.id} className="bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2 ${
                    color === "orange"
                      ? "bg-orange-500/10"
                      : color === "blue"
                      ? "bg-blue-500/10"
                      : color === "purple"
                      ? "bg-purple-500/10"
                      : "bg-teal-500/10"
                  } rounded-lg`}
                >
                  <div
                    className={`w-8 h-8 ${
                      color === "orange"
                        ? "bg-orange-500"
                        : color === "blue"
                        ? "bg-blue-500"
                        : color === "purple"
                        ? "bg-purple-500"
                        : "bg-teal-500"
                    } rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-gray-800" />
                  </div>
                </div>
              </div>

              <div>
                <h3
                  className={`${
                    data.value.toString().length > 15 ? "text-2xl" : "text-3xl"
                  } font-bold text-white`}
                >
                  {formatNumber(data.value)}
                </h3>
                <p className="text-gray-400 text-lg">{getTitle(idx)}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
}
