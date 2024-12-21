import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase.config";
import { useUser } from "@/context/UserContext";

export default function TopProducts() {
  const { id } = useUser();

  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        // Fetch orders for the restaurant
        const ordersQuery = query(
          collection(db, "orders"),
          where("restaurantId", "==", id)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        // Aggregate product counts
        const productCounts = {};
        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          orderData.products.forEach((product) => {
            productCounts[product.id] =
              (productCounts[product.id] || 0) + product.count;
          });
        });

        // Fetch restaurant document to get product names
        const restaurantDoc = await getDoc(doc(db, "restaurants", id));
        if (!restaurantDoc.exists()) {
          throw new Error("Restaurant not found");
        }
        const restaurantData = restaurantDoc.data();
        const menuMap = new Map(
          restaurantData.menu.map((item) => [item.id, item.title])
        );

        // Create sorted product array
        const sortedProducts = Object.entries(productCounts)
          .map(([id, count]) => ({
            id,
            name: menuMap.get(id) || "Unknown Product",
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopProducts(sortedProducts);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching top products:", err);
        setError("Failed to load top products. Please try again later.");
        setIsLoading(false);
      }
    }

    fetchTopProducts();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-white">Yuklanmoqda...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-red-500">{error}</div>
    );
  }

  const maxCount = Math.max(...topProducts.map((product) => product.count));

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Top Mahsulotlar</h2>
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center justify-between max-[420px]:flex-col max-[420px]:items-start"
          >
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-white">{product.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: `${(product.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-teal-500">{product.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
