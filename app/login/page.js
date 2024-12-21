"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { db } from "@/firebase.config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LogIn } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setId, id } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (id !== null && id !== undefined) {
      router.push("/");
    }
  }, [id, router]);

  if (id !== null && id !== undefined) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const restaurantsRef = collection(db, "restaurants");
      const q = query(
        restaurantsRef,
        where("admin.username", "==", username.toLowerCase()),
        where("admin.password", "==", password)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Username yoki parol noto‘g‘ri");
        setIsLoading(false);
        return;
      }

      const restaurantDoc = querySnapshot.docs[0];
      const restaurantId = restaurantDoc.id;

      localStorage.setItem("userId", restaurantId);
      setId(restaurantId);
      router.push("/");
    } catch (error) {
      console.error("Error during login:", error);
      setError(
        "Tizimga kirishda xatolik yuz berdi. Iltimos, qayta urinib koʻring."
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen w-full bg-gray-900">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 shadow-2xl rounded-lg px-12 pt-12 pb-16"
        >
          <div className="text-center mb-8">
            <LogIn className="inline-block w-16 h-16 text-teal-500 mb-4" />
            <h2 className="text-3xl font-bold text-white">Oxa Admin</h2>
            <p className="text-gray-400 mt-2">
              Iltimos hisobingizga kirish uchun pastdagi qatorlarni to'ldiring
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 text-center rounded-md">
              {error}
            </div>
          )}
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus:ring-1"
              required
            />
          </div>
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Parol
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus:ring-1"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-500 text-white py-3 rounded-md font-semibold transition duration-300 ease-in-out hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Yuklanmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </main>
  );
}
