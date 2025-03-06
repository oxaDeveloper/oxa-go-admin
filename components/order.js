import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/firebase.config";

export default function Order({ order }) {
  const [isProducts, setIsProducts] = useState(false);
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ArrowIcon = isProducts ? ChevronUp : ChevronDown;

  useEffect(() => {
    const restaurantRef = doc(db, "restaurants", order.restaurantId);
    const unsubscribe = onSnapshot(
      restaurantRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const restaurantData = docSnapshot.data();
          setRestaurantMenu(restaurantData.menu || []);
        } else {
          setError("Restaurant not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching restaurant data:", err);
        setError("Error fetching restaurant data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [order.restaurantId]);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatTime = (orderedAt) => {
    let date;

    if (orderedAt && typeof orderedAt.toDate === "function") {
      date = orderedAt.toDate();
    } else {
      date = new Date(orderedAt);
    }

    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "wait":
        return "bg-teal-500";
      case "cooking":
        return "bg-orange-500";
      case "courier":
        return "bg-red-500";
      case "done":
        return "bg-blue-500";
      case "delivering":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "wait":
        return "Kutilmoqda";
      case "cooking":
        return "Tayyorlanmoqda";
      case "courier":
        return "Kuryer";
      case "done":
        return "Tayyor";
      case "delivering":
        return "Yetkazilmoqda";
      default:
        return "Noma'lum";
    }
  };

  const handleStatusUpdate = async () => {
    const orderRef = doc(db, "orders", order.id);
    let newStatus;

    switch (order.status) {
      case "wait":
        newStatus = "cooking";
        break;
      case "cooking":
        order?.soboy ? (newStatus = "done") : (newStatus = "search_courier");
        break;
      case "courier":
        newStatus = "delivering";
        break;
      case "done":
        newStatus = "delivered";
        break;
      default:
        return;
    }

    try {
      await updateDoc(orderRef, {
        status: newStatus,
      });
      console.log("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-white">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const getProductDetails = (productId) => {
    return restaurantMenu.find((product) => product.id === productId) || {};
  };

  return (
    <div className="flex flex-col bg-gray-800 hover:bg-gray-700 max-md:px-4 px-6 py-4 duration-200 rounded-lg">
      <div
        className="flex items-center justify-between cursor-pointer md:gap-2 gap-5 max-md:flex-col"
        onClick={() => setIsProducts(!isProducts)}
      >
        <div className="flex justify-between max-md:w-full">
          <h1 className="lg:text-lg text-sm text-white lg:min-w-16 min-w-8 text-center">
            {order.secretCode}
          </h1>

          <h3
            className={`md:hidden uppercase text-xs text-gray-800 ${getStatusColor(
              order.status
            )} rounded-lg lg:min-w-32 text-center py-1 px-3`}
          >
            {getStatusText(order.status)}
          </h3>

          <h2 className="md:hidden lg:text-lg text-sm text-white lg:min-w-32 text-center">
            {formatTime(order.orderedAt)}
          </h2>
        </div>

        <div className="flex items-center max-md:justify-between max-md:w-full gap-5 md:gap-20 2xl:gap-36">
          <h1 className="lg:text-lg text-sm text-white lg:min-w-32 text-center">
            +998{order.phoneNumber}
          </h1>
          <h2 className="lg:text-lg text-sm text-white lg:min-w-32 text-center">
            {formatNumber(order.price)} so'm
          </h2>
          <h2 className="max-md:hidden lg:text-lg text-sm text-white lg:min-w-32 text-center">
            {formatTime(order.orderedAt)}
          </h2>
          <h3
            className={`max-md:hidden uppercase text-xs text-gray-800 ${getStatusColor(
              order.status
            )} rounded-lg lg:min-w-32 text-center py-1`}
          >
            {getStatusText(order.status)}
          </h3>
        </div>

        <div className="bg-white/10 p-1 rounded-lg hidden md:block">
          <ArrowIcon className="w-6 h-6" color="white" />
        </div>
      </div>

      <div
        className={`grid gap-4 pt-4 ${
          !isProducts && "hidden"
        } max-md:border-t max-md:mt-5`}
      >
        {order.products.map((orderProduct) => {
          const product = getProductDetails(orderProduct.id);
          return (
            <div key={orderProduct.id} className="grid w-full">
              {order?.courier && order?.courier !== "" && (
                <div className="flex justify-end items-center">
                  <h1 className="text-white text-xl my-2 border-b">
                    Kuryer: {order?.courier}
                  </h1>
                </div>
              )}

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center sm:gap-5 gap-2">
                  <Image
                    src={product.img || "/placeholder.svg"}
                    alt={product.title || "Product Image"}
                    width={64}
                    height={64}
                    className="sm:w-16 sm:h-16 w-12 h-12 object-cover sm:rounded-xl rounded-md"
                  />

                  <div className="sm:min-w-44">
                    <h1 className="sm:text-xl text-sm text-white">
                      {product.title || "Unknown Product"}
                    </h1>
                    <h1 className="sm:text-base text-xs text-white/30">
                      {product.category || "Uncategorized"}
                    </h1>
                  </div>
                </div>

                <p className="sm:text-xl text-sm text-white">
                  {orderProduct.count} ta
                </p>
                <div className="sm:min-w-44 max-sm:ml-2 grid justify-end">
                  <p className="sm:text-xl text-sm text-white">
                    {formatNumber((product.price || 0) * orderProduct.count)}{" "}
                    so'm
                  </p>
                  <p className="sm:text-base text-xs text-white/30">
                    1 x {formatNumber(product.price || 0)} so'm
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {order.status !== "delivering" && (
          <div className="flex justify-end">
            <div
              className="flex items-center gap-2 bg-gray-900 cursor-pointer px-4 py-2 rounded-lg"
              onClick={handleStatusUpdate}
            >
              <span className="sm:text-lg text-sm text-white">
                {order.status === "cooking" && order?.soboy
                  ? "Tayyor (Saboy)"
                  : order.status === "wait"
                  ? "Tayyorlash"
                  : order.status === "cooking"
                  ? "Kuryer chaqirish"
                  : order.status === "courier"
                  ? "Jo'natildi"
                  : order.status === "done" && "Mijozga berildi"}
              </span>
              <ArrowRight className="w-5 h-5" color="white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
